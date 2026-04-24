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
    love:              { type: 'string' as const, description: '2 sentences max about love and relationships' },
    job:               { type: 'string' as const, description: '2 sentences max about work and career' },
    health:            { type: 'string' as const, description: '2 sentences max about health and energy' },
    theme:             { type: 'string' as const, description: '3-5 simple words describing today for this sign' },
    planetary_weather: { type: 'string' as const, description: 'One simple sentence about today\'s cosmic energy' },
  },
  required: ['love', 'job', 'health', 'theme', 'planetary_weather'],
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

      // ── Inner function: generate + upsert one sign — returns true on success ─
      async function generateSignHoroscope(zodiacSign: string): Promise<boolean> {
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
          return false
        }

        if (existing) {
          return true
        }

        // ── Build Claude prompt ───────────────────────────────────────────────
        const userPrompt = `Write a daily horoscope for ${zodiacSign} for today ${targetDate}.
Use these real planetary positions: Sun in ${transits.sun.sign} at ${transits.sun.degree} degrees, Moon in ${transits.moon.sign} (${transits.moonPhaseName}), Mercury in ${transits.mercury.sign}, Venus in ${transits.venus.sign}, Mars in ${transits.mars.sign}, Jupiter in ${transits.jupiter.sign}, Saturn in ${transits.saturn.sign}.

Write exactly 3 sections. Each section is 2 short sentences maximum. Use simple, clear words.

LOVE: How do the planets affect relationships and feelings today?
JOB: What does today mean for work, focus, and decisions?
HEALTH: What should this person pay attention to for their body and energy today?

Keep each section short and practical. Do not use complicated astrology words.

RESPOND WITH VALID JSON ONLY. No preamble. No markdown. No explanation.`

        // ── Call Claude ───────────────────────────────────────────────────────
        type HoroscopeOutput = { love: string; job: string; health: string; theme: string; planetary_weather: string }
        let parsed: HoroscopeOutput | null = null

        try {
          const message = await withAiRetry(`generate-daily-horoscope:${zodiacSign}`, () =>
            client.messages.parse({
              model:      'claude-sonnet-4-6',
              max_tokens: 800,
              system:     'You are an astrologer writing short, clear daily horoscopes. Write in simple English that anyone can understand, including people who are not native English speakers. Use short sentences. Avoid complicated words. Be warm, direct, and practical.',
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
            return false
          }
        } catch (err: any) {
          console.error(
            `[generate-daily-horoscope] Claude call failed for ${zodiacSign}:`,
            err?.message ?? err,
          )
          return false
        }

        // ── Upsert into daily_zodiac_cache ────────────────────────────────────
        if (!parsed) { return false }

        const { error: upsertErr } = await supabase
          .from('daily_zodiac_cache')
          .upsert(
            {
              zodiac_sign:       zodiacSign,
              cache_date:        targetDate,
              language,
              horoscope:         '',
              love:              parsed.love,
              job:               parsed.job,
              health:            parsed.health,
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
          return false
        }

        return true
      }

      // ── Main loop ────────────────────────────────────────────────────────────
      let generated = 0
      let skipped   = 0
      const failedSigns: string[] = []

      for (const zodiacSign of ZODIAC_SIGNS) {
        console.log('[generate-daily-horoscope] Processing sign:', zodiacSign)
        const ok = await generateSignHoroscope(zodiacSign)
        if (ok) {
          generated++
          console.log('[generate-daily-horoscope] Completed sign:', zodiacSign, '— generated:', generated, 'skipped:', skipped)
        } else {
          failedSigns.push(zodiacSign)
        }
      }

      console.log(
        `[generate-daily-horoscope] First pass: generated=${generated} skipped=${skipped} failed=${failedSigns.length} date=${targetDate} language=${language}`,
      )

      // ── Post-loop verification + retry ───────────────────────────────────────
      const { data: presentRows } = await supabase
        .from('daily_zodiac_cache')
        .select('zodiac_sign')
        .eq('cache_date', targetDate)
        .eq('language', language)

      const presentSigns = new Set((presentRows ?? []).map((r: { zodiac_sign: string }) => r.zodiac_sign))
      const missingSigns = ZODIAC_SIGNS.filter(s => !presentSigns.has(s))
      const toRetry      = Array.from(new Set([...failedSigns, ...missingSigns]))

      if (toRetry.length > 0) {
        console.log(`[generate-daily-horoscope] Signs to retry: ${toRetry.join(', ')}`)

        for (const sign of toRetry) {
          let succeeded = false
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`[generate-daily-horoscope] Retrying ${sign} attempt ${attempt}/3`)
            await new Promise(r => setTimeout(r, 2000))
            const ok = await generateSignHoroscope(sign)
            if (ok) {
              succeeded = true
              console.log(`[generate-daily-horoscope] Retry succeeded for ${sign} on attempt ${attempt}`)
              break
            }
          }
          if (!succeeded) {
            console.error(`[generate-daily-horoscope] All 3 retry attempts failed for ${sign}`)
          }
        }
      }

      // ── Final verification query ──────────────────────────────────────────────
      const { data: finalRows } = await supabase
        .from('daily_zodiac_cache')
        .select('zodiac_sign')
        .eq('cache_date', targetDate)
        .eq('language', language)

      const finalPresent    = new Set((finalRows ?? []).map((r: { zodiac_sign: string }) => r.zodiac_sign))
      const finalConfirmed  = ZODIAC_SIGNS.filter(s => finalPresent.has(s))
      const finalFailed     = ZODIAC_SIGNS.filter(s => !finalPresent.has(s))

      console.log(`[generate-daily-horoscope] FINAL STATUS — date: ${targetDate}`)
      console.log(`[generate-daily-horoscope] Confirmed in DB: ${finalConfirmed.join(', ')}`)
      console.log(`[generate-daily-horoscope] Permanently failed: ${finalFailed.length > 0 ? finalFailed.join(', ') : 'none'}`)
    } catch (outerErr: any) {
      console.error('[generate-daily-horoscope] Fatal background error:', outerErr?.message)
    }
  })

  return { success: true, message: 'Horoscope generation started', targetDate, language }
})
