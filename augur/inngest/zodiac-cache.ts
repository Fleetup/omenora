/// <reference types="node" />
import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { createClient } from '@supabase/supabase-js'
import { getPlanetaryTransits } from '../server/utils/planetaryTransits'
import { withAiRetry } from '../server/utils/ai-retry'
import { inngest, cacheZodiacGenerate } from './client'

/**
 * Zodiac cache Inngest functions (orchestrator + worker).
 *
 * zodiacCacheOrchestrator — cron at 0 5 * * * (5:00 AM UTC)
 *   Fans out 12 cache/zodiac.generate events, one per sign.
 *   Uses the cron event timestamp (not new Date()) so all 12 workers
 *   share the same stable targetDate even if the orchestrator retries.
 *
 * zodiacCacheWorker — triggered by cache/zodiac.generate
 *   Step 1: fetch planetary transit data for targetDate (ephemeris)
 *   Step 2: call Claude with the exact same prompt as generate-daily-horoscope
 *   Step 3: upsert into daily_zodiac_cache ON CONFLICT (zodiac_sign, cache_date, language)
 *
 * Concurrency: shared account-scoped key "anthropic-api" limit 5 —
 * same key used by welcome-insight so the global Anthropic cap is respected.
 */

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const

const horoscopeJsonSchema = {
  type: 'object' as const,
  properties: {
    love:              { type: 'string' as const, description: '2 sentences max about love and relationships' },
    job:               { type: 'string' as const, description: '2 sentences max about work and career' },
    health:            { type: 'string' as const, description: '2 sentences max about health and energy' },
    theme:             { type: 'string' as const, description: '3-5 simple words describing today for this sign' },
    planetary_weather: { type: 'string' as const, description: "One simple sentence about today's cosmic energy" },
  },
  required: ['love', 'job', 'health', 'theme', 'planetary_weather'],
}

type HoroscopeOutput = {
  love:              string
  job:               string
  health:            string
  theme:             string
  planetary_weather: string
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

export const zodiacCacheOrchestrator = inngest.createFunction(
  {
    id:   'zodiac-cache-orchestrator',
    name: 'Zodiac Cache — daily fan-out (5 AM UTC)',
    triggers: [{ cron: '0 5 * * *' }],
    retries: 2,
  },
  async ({ event, step }) => {
    // Derive targetDate from the cron event timestamp — stable across retries.
    // event.ts is milliseconds since epoch; format as YYYY-MM-DD in UTC.
    const targetDate = new Date(event.ts).toISOString().split('T')[0] as string

    const events = await step.run('fan-out-signs', async () => {
      const sends = ZODIAC_SIGNS.map(sign =>
        cacheZodiacGenerate.create({ sign, targetDate, language: 'en' }),
      )
      await inngest.send(sends)
      return sends.length
    })

    console.info(`[zodiac-cache-orchestrator] Fanned out ${events} events for ${targetDate}`)
    return { fannedOut: events, targetDate }
  },
)

// ── Worker ────────────────────────────────────────────────────────────────────

export const zodiacCacheWorker = inngest.createFunction(
  {
    id:      'zodiac-cache-worker',
    name:    'Zodiac Cache — generate one sign',
    triggers: [{ event: cacheZodiacGenerate }],
    retries: 4,
    concurrency: {
      scope: 'account',
      key:   '"anthropic-api"',
      limit: 5,
    },
    idempotency: 'event.data.sign + "-" + event.data.targetDate',
  },
  async ({ event, step }) => {
    const { sign, targetDate, language } = event.data

    // ── Step 1: Fetch planetary transit data ─────────────────────────────────
    const transits = await step.run('fetch-transits', async () => {
      return getPlanetaryTransits(targetDate)
    })

    // ── Step 2: Generate horoscope via Claude ─────────────────────────────────
    const parsed = await step.run('generate-horoscope', async () => {
      const client = new Anthropic({ apiKey: process.env.NUXT_ANTHROPIC_API_KEY ?? '' })

      const dateLabel = new Date(`${targetDate}T12:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
      })

      const userPrompt = `Write a daily horoscope for ${sign} for today ${dateLabel}.
Use these real planetary positions: Sun in ${transits.sun.sign} at ${transits.sun.degree} degrees, Moon in ${transits.moon.sign} (${transits.moonPhaseName}), Mercury in ${transits.mercury.sign}, Venus in ${transits.venus.sign}, Mars in ${transits.mars.sign}, Jupiter in ${transits.jupiter.sign}, Saturn in ${transits.saturn.sign}.

Write exactly 3 sections. Each section is 2 short sentences maximum. Use simple, clear words.

LOVE: How do the planets affect relationships and feelings today?
JOB: What does today mean for work, focus, and decisions?
HEALTH: What should this person pay attention to for their body and energy today?

Keep each section short and practical. Do not use complicated astrology words.

RESPOND WITH VALID JSON ONLY. No preamble. No markdown. No explanation.`

      const message = await withAiRetry(`zodiac-cache-worker:${sign}`, () =>
        client.messages.parse({
          model:      'claude-sonnet-4-6',
          max_tokens: 800,
          system:     'You are an astrologer writing short, clear daily horoscopes. Write in simple English that anyone can understand, including people who are not native English speakers. Use short sentences. Avoid complicated words. Be warm, direct, and practical.',
          messages:   [{ role: 'user', content: userPrompt }],
          output_config: { format: jsonSchemaOutputFormat(horoscopeJsonSchema) },
        }),
      )

      const output = message.parsed_output as unknown as HoroscopeOutput | null
      if (!output) {
        const firstBlock = message.content[0]
        const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''
        console.error(`[zodiac-cache-worker] Structured output null for ${sign}`, {
          rawResponsePreview: (rawText || '').slice(0, 300),
          targetDate,
        })
        throw new Error(`Claude returned null parsed_output for sign ${sign}`)
      }

      return output
    })

    // ── Step 3: Upsert into daily_zodiac_cache ────────────────────────────────
    await step.run('upsert-cache', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { error } = await supabase
        .from('daily_zodiac_cache')
        .upsert(
          {
            zodiac_sign:       sign,
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
          { onConflict: 'zodiac_sign,cache_date,language' },
        )

      if (error) {
        console.error(`[zodiac-cache-worker] Upsert failed for ${sign}:`, error.code, error.message)
        throw new Error(`daily_zodiac_cache upsert failed for ${sign}: ${error.message}`)
      }

      console.info(`[zodiac-cache-worker] Upserted ${sign} for ${targetDate}`)
      return { upserted: true }
    })

    return { ok: true, sign, targetDate }
  },
)
