/**
 * POST /api/generate-daily-horoscope
 *
 * Pre-generates daily horoscopes for all 12 zodiac signs using real planetary
 * transit data and stores the results in the daily_zodiac_cache table. Called
 * once per day by the Railway cron before the daily horoscope dispatcher runs.
 *
 * Protected by a shared secret (NUXT_EMAIL_JOB_SECRET) so only Railway
 * cron can trigger it — not arbitrary internet callers.
 *
 * Railway cron config:
 *   schedule: "0 5 * * *"   (5:00 AM UTC daily)
 *   command:  POST https://omenora.com/api/generate-daily-horoscope
 *   headers:  { "x-job-secret": "$EMAIL_JOB_SECRET" }
 */

import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { getPlanetaryTransits } from '~~/server/utils/planetaryTransits'
import { withAiRetry } from '~~/server/utils/ai-retry'

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const

type ZodiacSign = typeof ZODIAC_SIGNS[number]

const horoscopeJsonSchema = {
  type: 'object' as const,
  properties: {
    horoscope:         { type: 'string' as const },
    theme:             { type: 'string' as const },
    planetary_weather: { type: 'string' as const },
  },
  required: ['horoscope', 'theme', 'planetary_weather'],
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only Railway cron may call this ────────────────────────────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const rawDate    = sanitizeString(body.targetDate ?? '', 10)
  const language   = sanitizeString(body.language || 'en', 5)
  const targetDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate
    : new Date().toISOString().split('T')[0]!

  // ── Return immediately — processing runs in the background ─────────────────
  setImmediate(async () => {
    try {
      const supabase = createSupabaseAdmin()
      const client   = new Anthropic({ apiKey: config.anthropicApiKey as string })

      // ── Get today's planetary positions once for all signs ──────────────────
      let transits: Awaited<ReturnType<typeof getPlanetaryTransits>>
      try {
        transits = getPlanetaryTransits(targetDate)
      } catch (err: any) {
        console.error('[generate-daily-horoscope] Failed to calculate planetary transits:', err?.message)
        return
      }

      const dateLabel = new Date(`${targetDate}T12:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
      })

      let generated = 0
      let skipped   = 0
      let failed    = 0

      for (const zodiacSign of ZODIAC_SIGNS) {
        console.log('[generate-daily-horoscope] Processing sign:', zodiacSign)

        // ── Check if cache row already exists for this (sign, date, language) ─
        const { data: existing, error: existsErr } = await supabase
          .from('daily_zodiac_cache')
          .select('id')
          .eq('zodiac_sign', zodiacSign)
          .eq('cache_date', targetDate)
          .eq('language', language)
          .maybeSingle()

        if (existsErr) {
          console.error(
            `[generate-daily-horoscope] Existence check failed for ${zodiacSign}:`,
            existsErr.code,
          )
          failed++
          continue
        }

        if (existing) {
          skipped++
          continue
        }

        // ── Build Claude prompt ───────────────────────────────────────────────
        const userPrompt = `Today is ${dateLabel}.

Write a daily horoscope for ${zodiacSign}.

Today's planetary positions:
- Sun is in ${transits.sun.sign} at ${transits.sun.degree} degrees
- Moon is in ${transits.moon.sign} at ${transits.moon.degree} degrees (${transits.moonPhaseName})
- Mercury is in ${transits.mercury.sign}, Venus is in ${transits.venus.sign}, Mars is in ${transits.mars.sign}
- Jupiter is in ${transits.jupiter.sign}, Saturn is in ${transits.saturn.sign}

Write a 3-4 sentence daily horoscope for ${zodiacSign} for today, ${dateLabel}. Focus on what today's planetary positions mean specifically for this sign. Include one practical guidance or reflection. End with one sentence about the moon's influence today.

Also provide:
- theme: 3-5 words capturing today's energy for ${zodiacSign}
- planetary_weather: one sentence describing the overall cosmic weather today (same for all signs)

RESPOND WITH VALID JSON ONLY. No preamble. No markdown. No explanation.`

        // ── Call Claude ───────────────────────────────────────────────────────
        type HoroscopeOutput = { horoscope: string; theme: string; planetary_weather: string }
        let parsed: HoroscopeOutput | null = null

        try {
          const message = await withAiRetry(`generate-daily-horoscope:${zodiacSign}`, () =>
            client.messages.parse({
              model:      'claude-sonnet-4-6',
              max_tokens: 1500,
              system:     'You are a professional astrologer writing daily horoscopes. Write in a warm, insightful, and grounded tone. Be specific to today\'s planetary positions. Never be vague or generic. Each horoscope must feel written specifically for today, not any other day.',
              messages:   [{ role: 'user', content: userPrompt }],
              output_config: { format: jsonSchemaOutputFormat(horoscopeJsonSchema) },
            })
          )

          parsed = message.parsed_output as unknown as HoroscopeOutput | null

          if (!parsed) {
            const firstBlock = message.content[0]
            const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''
            console.error(
              `[generate-daily-horoscope] Structured output returned null parsed_output for ${zodiacSign}`,
              { rawResponsePreview: (rawText || '').slice(0, 300) },
            )
            failed++
            continue
          }
        } catch (err: any) {
          console.error(
            `[generate-daily-horoscope] Claude call failed for ${zodiacSign}:`,
            err?.message ?? err,
          )
          failed++
          continue
        }

        // ── Upsert into daily_zodiac_cache ────────────────────────────────────
        if (!parsed) { failed++; continue }

        const { error: upsertErr } = await supabase
          .from('daily_zodiac_cache')
          .upsert(
            {
              zodiac_sign:       zodiacSign,
              cache_date:        targetDate,
              language,
              horoscope:         parsed.horoscope,
              theme:             parsed.theme,
              moon_phase:        transits.moonPhaseName,
              sun_sign:          transits.sun.sign,
              moon_sign:         transits.moon.sign,
              planetary_weather: parsed.planetary_weather,
              created_at:        new Date().toISOString(),
            },
            { onConflict: 'zodiac_sign,cache_date,language', ignoreDuplicates: true },
          )

        if (upsertErr) {
          console.error(
            `[generate-daily-horoscope] Upsert failed for ${zodiacSign}:`,
            upsertErr.code,
          )
          failed++
          continue
        }

        generated++

        console.log('[generate-daily-horoscope] Completed sign:', zodiacSign, '— generated:', generated, 'skipped:', skipped, 'failed:', failed)
      }

      console.log(
        `[generate-daily-horoscope] Completed: generated=${generated} skipped=${skipped} failed=${failed} date=${targetDate} language=${language}`,
      )
    } catch (outerErr: any) {
      console.error('[generate-daily-horoscope] Fatal background error:', outerErr?.message)
    }
  })

  return { success: true, message: 'Horoscope generation started', targetDate, language }
})
