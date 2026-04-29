/// <reference types="node" />
import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { createClient } from '@supabase/supabase-js'
import { getPlanetaryTransits } from '../server/utils/planetaryTransits'
import { withAiRetry } from '../server/utils/ai-retry'
import { inngest, cacheArchetypeGenerate } from './client'

/**
 * Archetype cache Inngest functions (orchestrator + worker).
 *
 * archetypeCacheOrchestrator — cron at 0 6 * * * (6:00 AM UTC)
 *   Fans out 12 cache/archetype.generate events, one per archetype.
 *   Uses the cron event timestamp (not new Date()) so all 12 workers
 *   share the same stable targetDate even if the orchestrator retries.
 *
 * archetypeCacheWorker — triggered by cache/archetype.generate
 *   Step 1: fetch planetary transit data for targetDate (ephemeris)
 *   Step 2: call Claude with the exact same prompt as generate-daily-insight
 *           (love, work, health, reflection_question in one structured call)
 *   Step 3: upsert into daily_archetype_cache:
 *           - love, work, health, reflection  — the four new per-section columns
 *           - insight                         — combined love + work + health
 *             (backward compat: process-daily-insights reads insight as a blob)
 *           - reflection_question             — existing column, same value as reflection
 *           ON CONFLICT (archetype, cache_date, language) DO UPDATE
 *
 * Concurrency: shared account-scoped key "anthropic-api" limit 5 —
 * same key as welcome-insight and zodiac-cache-worker.
 *
 * insight column backward-compat note:
 *   The existing Railway cron sets insight = love only (insight.love).
 *   process-daily-insights.post.ts reads cached.insight and passes it as
 *   love/work/health all at once (lines 157-159). To make the combined
 *   content available from this path, insight is now set to:
 *     love + "\n\n" + work + "\n\n" + health
 *   This is strictly additive — the existing /daily page reads insight
 *   as a text blob and the combined version contains all three sections.
 */

const ARCHETYPES = [
  'phoenix',
  'architect',
  'storm',
  'lighthouse',
  'wanderer',
  'alchemist',
  'guardian',
  'visionary',
  'mirror',
  'catalyst',
  'sage',
  'wildfire',
] as const

const insightJsonSchema = {
  type: 'object',
  properties: {
    love:                { type: 'string' },
    work:                { type: 'string' },
    health:              { type: 'string' },
    reflection_question: { type: 'string' },
    theme:               { type: 'string' },
  },
  required: ['love', 'work', 'health', 'reflection_question', 'theme'],
} as const

type InsightOutput = {
  love:                string
  work:                string
  health:              string
  reflection_question: string
  theme:               string
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

export const archetypeCacheOrchestrator = inngest.createFunction(
  {
    id:   'archetype-cache-orchestrator',
    name: 'Archetype Cache — daily fan-out (6 AM UTC)',
    triggers: [{ cron: '0 6 * * *' }],
    retries: 2,
  },
  async ({ event, step }) => {
    // Derive targetDate from the cron event timestamp — stable across retries.
    // event.ts is milliseconds since epoch; format as YYYY-MM-DD in UTC.
    const targetDate = new Date(event.ts).toISOString().split('T')[0] as string

    const events = await step.run('fan-out-archetypes', async () => {
      const sends = ARCHETYPES.map(archetype =>
        cacheArchetypeGenerate.create({ archetype, targetDate, language: 'en' }),
      )
      await inngest.send(sends)
      return sends.length
    })

    console.info(`[archetype-cache-orchestrator] Fanned out ${events} events for ${targetDate}`)
    return { fannedOut: events, targetDate }
  },
)

// ── Worker ────────────────────────────────────────────────────────────────────

export const archetypeCacheWorker = inngest.createFunction(
  {
    id:      'archetype-cache-worker',
    name:    'Archetype Cache — generate one archetype',
    triggers: [{ event: cacheArchetypeGenerate }],
    retries: 4,
    concurrency: {
      scope: 'account',
      key:   '"anthropic-api"',
      limit: 5,
    },
    idempotency: 'event.data.archetype + "-" + event.data.targetDate',
  },
  async ({ event, step }) => {
    const { archetype, targetDate, language } = event.data

    // ── Step 1: Fetch planetary transit data ─────────────────────────────────
    const transits = await step.run('fetch-transits', async () => {
      return getPlanetaryTransits(targetDate)
    })

    // ── Step 2: Generate insight via Claude ───────────────────────────────────
    // Replicates generate-daily-insight.post.ts exactly:
    //   - same model (claude-sonnet-4-6)
    //   - same max_tokens (1500)
    //   - same system prompt
    //   - same prompt structure including all safety rules
    // Uses neutral placeholder values (firstName=Friend, lifePathNumber=5,
    // element='', region='western') — same as the existing Railway cron.
    const parsed = await step.run('generate-insight', async () => {
      const client = new Anthropic({ apiKey: process.env.NUXT_ANTHROPIC_API_KEY ?? '' })

      const firstName      = 'Friend'
      const lifePathNumber = 5
      const element        = ''
      const moonPhaseName  = transits.moonPhaseName
      const todayTheme     = `${transits.sun.sign} season, Moon in ${transits.moon.sign}`

      const today       = new Date(`${targetDate}T12:00:00Z`)
      const startOfYear = new Date(today.getFullYear(), 0, 0)
      const dayOfYear   = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
      const dateString  = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
      })

      const langInstruction = 'Respond entirely in English.'
      const regionalStyle   = 'Use behavioral science framing.'

      const insightPrompt = `${langInstruction}

You are generating a daily destiny insight for ${firstName}, whose archetype is ${archetype} and life path number is ${lifePathNumber}.

TODAY: ${dateString} (day ${dayOfYear} of the year)
TODAY'S THEME: ${todayTheme}
Moon Phase: ${moonPhaseName}
Regional style: ${regionalStyle}

TODAY'S PLANETARY POSITIONS:
- Sun in ${transits.sun.sign} at ${transits.sun.degree}°
- Moon in ${transits.moon.sign} at ${transits.moon.degree}° (${transits.moonPhaseName})
- Mercury in ${transits.mercury.sign}, Venus in ${transits.venus.sign}, Mars in ${transits.mars.sign}

RECENT THEMES SENT TO THIS USER — DO NOT REPEAT:
none yet

---

CONTENT REQUIREMENTS:

1. LOVE section: How today's planetary energy affects ${firstName}'s relationships, emotional connections, and how they give/receive affection. Ground this in their ${archetype} archetype pattern — how this archetype specifically experiences love.
2. WORK section: How today's energy affects ${firstName}'s focus, productivity, and professional decisions. Ground this in their life path ${lifePathNumber} — how this number approaches work and accomplishment.
3. HEALTH section: Physical and mental wellbeing for today. Ground this in their ${element || archetype} element — how this element manifests in body and mind under today's moon phase (${moonPhaseName}).
4. REFLECTION QUESTION: One precise inward-facing question that ties the day's theme to their specific archetype.
5. THEME: Keep the existing theme label (planetary summary, max 60 chars).

Each section is 2-3 sentences. Never generic. Never applicable to all people — if it could be said to anyone, rewrite it.

---

ABSOLUTE SAFETY REQUIREMENTS — NON-NEGOTIABLE:

LANGUAGE RULES:
- NEVER use directive language: "you should", "avoid", "don't", "you must", "be careful", "stay away from", "you need to"
- ALWAYS use reflective language: "you might notice", "consider whether", "you find that", "this could be a moment to", "a question worth sitting with"
- Write as a wise, warm friend who reflects — not as an authority, advisor, or psychic

FORBIDDEN CONTENT DOMAINS:
- Never reference or imply guidance on physical or mental health, medical decisions, symptoms
- Never reference financial decisions, money moves, investments, debt, purchases
- Never reference legal situations of any kind
- Never tell the user whether to stay in or leave any relationship
- Never reference specific career decisions with real stakes ("take the job", "quit now")
- If today's theme touches these areas, address ONLY the internal emotional layer, never the external decision

TONE AND EMOTIONAL SAFETY:
- Never imply something bad will happen today
- Never create anxiety or dread about the day ahead
- Never use: crisis, warning, danger, blocked, cursed, difficult energy ahead, dark period
- Shadow or difficult themes MUST end with an empowering reframe — never leave the user in darkness
- Every insight must leave the user feeling more capable and more themselves, not worried

DEPENDENCY PREVENTION:
- Never position OMENORA or astrology as the final authority on their life
- Never say "the stars command" or "destiny requires" as directives
- Position the insight as one lens among many, an invitation to reflect — not a verdict

REFLECTION QUESTION RULES:
- Must turn inward toward self-knowledge
- Must NEVER point toward a specific external decision
- GOOD: "What would it feel like to trust yourself more in this area today?"
- GOOD: "Where are you giving more than you are receiving right now?"
- GOOD: "What does your wisest self already know about this?"
- BAD: "Should you leave this relationship?"
- BAD: "Is this job worth staying in?"
- BAD: "Are you making a mistake?"

---

RESPOND WITH VALID JSON ONLY.
No preamble. No markdown. No explanation.
Exactly this structure:

{
  "love": "...",
  "work": "...",
  "health": "...",
  "reflection_question": "one inward-facing question",
  "theme": "${todayTheme}"
}`

      const message = await withAiRetry(`archetype-cache-worker:${archetype}`, () =>
        client.messages.parse({
          model:      'claude-sonnet-4-6',
          max_tokens: 1500,
          system:     'You are writing a personalized daily horoscope for one specific person — not their sun sign, but their exact archetype, life path, and elemental energy. Each section (love, work, health) must feel like it was written for them specifically, not for all people of their zodiac sign. Ground each insight in today\'s planetary positions. 2-3 sentences per section. Direct, grounded, specific. Never vague or generic.',
          messages:   [{ role: 'user', content: insightPrompt }],
          output_config: { format: jsonSchemaOutputFormat(insightJsonSchema) },
        }),
      )

      const output = message.parsed_output as unknown as InsightOutput | null
      if (!output) {
        const firstBlock = message.content[0]
        const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''
        console.error(`[archetype-cache-worker] Structured output null for ${archetype}`, {
          rawResponsePreview: (rawText || '').slice(0, 300),
          targetDate,
        })
        throw new Error(`Claude returned null parsed_output for archetype ${archetype}`)
      }

      return output
    })

    // ── Step 3: Upsert into daily_archetype_cache ─────────────────────────────
    await step.run('upsert-cache', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      // insight column: combine all three sections for backward compat.
      // process-daily-insights.post.ts reads cached.insight as a text blob
      // and passes it as love/work/health simultaneously. The combined
      // value preserves all section content for the existing daily email flow.
      const combinedInsight = `${parsed.love}\n\n${parsed.work}\n\n${parsed.health}`

      const { error } = await supabase
        .from('daily_archetype_cache')
        .upsert(
          {
            archetype,
            cache_date:          targetDate,
            language,
            insight:             combinedInsight,
            love:                parsed.love,
            work:                parsed.work,
            health:              parsed.health,
            reflection:          parsed.reflection_question,
            reflection_question: parsed.reflection_question,
            theme:               parsed.theme,
            moon_phase:          transits.moonPhaseName,
            created_at:          new Date().toISOString(),
          },
          { onConflict: 'archetype,cache_date,language' },
        )

      if (error) {
        console.error(`[archetype-cache-worker] Upsert failed for ${archetype}:`, error.code, error.message)
        throw new Error(`daily_archetype_cache upsert failed for ${archetype}: ${error.message}`)
      }

      console.info(`[archetype-cache-worker] Upserted ${archetype} for ${targetDate}`)
      return { upserted: true }
    })

    return { ok: true, archetype, targetDate }
  },
)
