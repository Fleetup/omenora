/// <reference types="node" />
import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { createClient } from '@supabase/supabase-js'
import { WeeklyTransitSchema, type WeeklyTransitType } from '../server/utils/ai-schemas'
import { withAiRetry } from '../server/utils/ai-retry'
import { getPlanetaryTransits } from '../server/utils/planetaryTransits'
import { inngest, transitWeeklySend } from './client'

/**
 * Weekly transit delivery Inngest functions (orchestrator + worker).
 *
 * weeklyTransitOrchestrator — cron at 0 8 * * 1 (Monday 8:00 AM UTC)
 *   Matches existing Railway cron schedule exactly.
 *   Fetches all active compatibility_plus subscribers excluding suppressed
 *   addresses (client-side Set filter — suppression in orchestrator per
 *   Phase 4 constraint pattern).
 *   Fans out one transit/weekly.send event per eligible subscriber.
 *   week_start derived from event.ts: the cron fires on Monday so
 *   new Date(event.ts).toISOString().split('T')[0] is the Monday date.
 *
 * weeklyTransitWorker — triggered by transit/weekly.send
 *   Step 1 — Fetch compatibility report (early exit if no_report)
 *   Step 2 — Fetch planetary transits for week start + end
 *   Step 3 — Generate weekly relationship weather via Claude
 *             (inline — no HTTP call to generate-weekly-transit.post.ts)
 *             Uses WeeklyTransitSchema + WeeklyTransitType from ai-schemas.ts
 *   Step 4 — Send email via /api/send-weekly-transit (Strategy B — HTTP)
 *   Step 5 — Log to email_send_log (ON CONFLICT DO NOTHING)
 *
 * Idempotency key: email + weekStart — C2 fix. If orchestrator fires twice
 * on the same Monday, the second batch of events deduplicates at Inngest layer.
 *
 * Concurrency: account-scoped "anthropic-api" limit 5 — shared with zodiac,
 * archetype, and welcome-insight workers to honour the global Claude cap.
 *
 * No 2-second sequential delay — Inngest's concurrency cap handles pacing.
 * This is the C1 fix: no more single-request timeout from sequential processing.
 */

const INNGEST_SEND_BATCH = 5000

// ── Orchestrator ─────────────────────────────────────────────────────────────

export const weeklyTransitOrchestrator = inngest.createFunction(
  {
    id:      'weekly-transit-orchestrator',
    name:    'Weekly Transit — fan-out compatibility_plus subscribers (Mon 8 AM UTC)',
    triggers: [{ cron: '0 8 * * 1' }],
    retries: 2,
  },
  async ({ event, step }) => {
    // week_start is the Monday date derived from the cron event timestamp.
    // The cron fires at 8:00 AM UTC on Monday, so event.ts falls on Monday UTC.
    const weekStart = new Date(event.ts).toISOString().split('T')[0] as string

    const { sentCount, totalCount } = await step.run('fetch-and-fan-out', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      // ── 1. Fetch suppressed emails (filter in orchestrator) ───────────────
      const { data: suppressedRows, error: suppErr } = await supabase
        .from('email_suppression')
        .select('email')

      if (suppErr) {
        console.error('[weekly-transit-orchestrator] Suppression fetch failed:', suppErr.code, suppErr.message)
        throw new Error(`email_suppression fetch failed: ${suppErr.message}`)
      }

      const suppressedEmails = new Set(
        (suppressedRows ?? []).map((r: { email: string }) => r.email.toLowerCase().trim()),
      )

      // ── 2. Fetch all active compatibility_plus subscribers ────────────────
      // Use range pagination to avoid Supabase's 1000-row default cap.
      const allSubscribers: Array<{
        email:           string
        first_name:      string | null
        archetype:       string | null
        life_path_number: number | null
        element:         string | null
        region:          string | null
      }> = []

      let rangeFrom    = 0
      const PAGE       = 1000
      let hasMorePages = true

      while (hasMorePages) {
        const { data: page, error: pageErr } = await supabase
          .from('subscribers')
          .select('email, first_name, archetype, life_path_number, element, region')
          .eq('active', true)
          .eq('plan_type', 'compatibility_plus')
          .range(rangeFrom, rangeFrom + PAGE - 1)

        if (pageErr) {
          console.error('[weekly-transit-orchestrator] Subscriber page fetch failed:', pageErr.code, pageErr.message)
          throw new Error(`subscribers fetch failed at range ${rangeFrom}: ${pageErr.message}`)
        }

        const rows = page ?? []
        allSubscribers.push(...rows)

        if (rows.length < PAGE) {
          hasMorePages = false
        } else {
          rangeFrom += PAGE
        }
      }

      // ── 3. Filter suppressed ──────────────────────────────────────────────
      const eligible = allSubscribers.filter(
        s => s.email && !suppressedEmails.has(s.email.toLowerCase().trim()),
      )

      console.info(
        `[weekly-transit-orchestrator] ${weekStart}: total=${allSubscribers.length} suppressed=${suppressedEmails.size} eligible=${eligible.length}`,
      )

      // ── 4. Fan out in batches of INNGEST_SEND_BATCH ───────────────────────
      const eventPayloads = eligible.map(s =>
        transitWeeklySend.create({
          email:          s.email,
          firstName:      (s.first_name ?? '') || 'Friend',
          archetype:      (s.archetype ?? '').toLowerCase().trim(),
          lifePathNumber: s.life_path_number ?? 0,
          element:        s.element ?? '',
          region:         s.region ?? 'western',
          weekStart,
        }),
      )

      for (let i = 0; i < eventPayloads.length; i += INNGEST_SEND_BATCH) {
        const batch = eventPayloads.slice(i, i + INNGEST_SEND_BATCH)
        await inngest.send(batch)
        console.info(
          `[weekly-transit-orchestrator] Sent batch ${Math.floor(i / INNGEST_SEND_BATCH) + 1}: ${batch.length} events`,
        )
      }

      return { sentCount: eligible.length, totalCount: allSubscribers.length }
    })

    console.info(
      `[weekly-transit-orchestrator] Fan-out complete for ${weekStart}: ${sentCount} events (${totalCount} total compat+)`,
    )

    return { ok: true, weekStart, sentCount, totalCount }
  },
)

// ── Worker ────────────────────────────────────────────────────────────────────

// JSON schema for Claude structured output — mirrors weeklyTransitJsonSchema
// in generate-weekly-transit.post.ts exactly.
const weeklyTransitJsonSchema = {
  type: 'object',
  properties: {
    connection:    { type: 'string' },
    communication: { type: 'string' },
    tension:       { type: 'string' },
    advice:        { type: 'string' },
    weekTheme:     { type: 'string' },
  },
  required: ['connection', 'communication', 'tension', 'advice', 'weekTheme'],
} as const

export const weeklyTransitWorker = inngest.createFunction(
  {
    id:      'weekly-transit-worker',
    name:    'Weekly Transit — generate and send one subscriber',
    triggers: [{ event: transitWeeklySend }],
    retries: 4,
    concurrency: {
      scope: 'account',
      key:   '"anthropic-api"',
      limit: 5,
    },
    idempotency: 'event.data.email + "-" + event.data.weekStart',
  },
  async ({ event, step }) => {
    const { email, firstName, archetype, lifePathNumber, element, region: _region, weekStart } = event.data

    // Compute week end (weekStart + 6 days) — mirrors generate-weekly-transit.
    const weekStartDate = new Date(`${weekStart}T00:00:00Z`)
    const weekEndDate   = new Date(weekStartDate)
    weekEndDate.setUTCDate(weekStartDate.getUTCDate() + 6)
    const weekEnd = weekEndDate.toISOString().split('T')[0] as string

    // ── Step 1: Fetch compatibility report ────────────────────────────────────
    // Mirrors STEP 3 in generate-weekly-transit.post.ts exactly.
    // If no report found: early exit {skipped: true} — not an error.
    // Subscribers who purchased compatibility_plus but haven't run a
    // compatibility reading yet are expected to be in this state.
    const reportData = await step.run('fetch-report', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { data: reportRows, error: reportError } = await supabase
        .from('reports')
        .select('compatibility_data')
        .eq('email', email)
        .eq('type', 'compatibility')
        .order('created_at', { ascending: false })
        .limit(1)

      if (reportError) {
        console.error('[weekly-transit-worker] Report fetch error:', reportError.code, reportError.message)
        throw new Error(`reports fetch failed for ${email}: ${reportError.message}`)
      }

      if (!reportRows || reportRows.length === 0) {
        return null
      }

      return reportRows[0]!.compatibility_data as Record<string, unknown> | null
    })

    if (reportData === null) {
      console.info(`[weekly-transit-worker] No compatibility report for ${email} — skipping`)
      return { skipped: true, reason: 'no_report', email, weekStart }
    }

    // ── Step 2: Fetch planetary transits for week window ─────────────────────
    // Mirrors STEP 2 in generate-weekly-transit.post.ts.
    const transits = await step.run('fetch-transits', async () => {
      const weekStartTransits = getPlanetaryTransits(weekStart)
      const weekEndTransits   = getPlanetaryTransits(weekEnd)
      return { weekStartTransits, weekEndTransits }
    })

    // ── Step 3: Generate weekly relationship weather via Claude ───────────────
    // Replicates STEP 4+5 of generate-weekly-transit.post.ts inline.
    // Uses WeeklyTransitSchema (imported from ai-schemas.ts — not redefined).
    // Same model, same max_tokens, same system prompt, same Claude prompt.
    const generated = await step.run('generate-transit', async () => {
      // Extract pairing data — mirrors STEP 4 in generate-weekly-transit.
      const cd = reportData as Record<string, unknown>
      const receipt         = cd && typeof cd.calculationReceipt === 'object' ? cd.calculationReceipt as Record<string, unknown> : null
      const p1              = receipt && typeof receipt['person1'] === 'object' ? receipt['person1'] as Record<string, unknown> : null
      const p2              = receipt && typeof receipt['person2'] === 'object' ? receipt['person2'] as Record<string, unknown> : null
      const sections = cd?.sections as Record<string, Record<string, unknown>> | undefined
      const sectionsChallenge = sections?.challenge?.content

      const person1SunSign     = typeof p1?.['sunSign']        === 'string' ? p1['sunSign']        : ''
      const person1LifePath    = typeof p1?.['lifePathNumber'] === 'number' ? p1['lifePathNumber'] : lifePathNumber
      const person1Archetype   = typeof p1?.['archetype']      === 'string' ? p1['archetype']      : archetype
      const person2SunSign     = typeof p2?.['sunSign']        === 'string' ? p2['sunSign']        : ''
      const person2LifePath    = typeof p2?.['lifePathNumber'] === 'number' ? p2['lifePathNumber'] : 0
      const compatibilityTitle = typeof cd['compatibilityTitle'] === 'string' ? cd['compatibilityTitle'] : ''
      const challengeContent   = typeof sectionsChallenge === 'string' ? sectionsChallenge : ''

      const { weekStartTransits, weekEndTransits } = transits

      const weeklyPrompt = `Generate a weekly relationship weather forecast for the week of ${weekStart} to ${weekEnd}.

PERSON 1: ${firstName} — ${person1Archetype} archetype, ${person1SunSign || 'unknown'} sun, Life Path ${person1LifePath}, ${element} element
PERSON 2: ${person2SunSign || 'unknown'} sun, Life Path ${person2LifePath}
THEIR KNOWN DYNAMIC: ${challengeContent || 'not available'}
THEIR COMPATIBILITY TITLE: ${compatibilityTitle || 'not available'}

THIS WEEK'S PLANETARY WEATHER:
Week start — Sun in ${weekStartTransits.sun.sign}, Moon in ${weekStartTransits.moon.sign}, Mercury in ${weekStartTransits.mercury.sign}, Venus in ${weekStartTransits.venus.sign}, Mars in ${weekStartTransits.mars.sign}
Week end — Moon moves to ${weekEndTransits.moon.sign}

Generate a forecast with these sections:
1. CONNECTION: How this week's energy affects the overall connection between these two people
2. COMMUNICATION: What to expect in how they talk to each other this week (Mercury influence)
3. TENSION: Any friction points to be aware of (honest — don't sugarcoat)
4. ADVICE: One specific, actionable thing they can do this week to strengthen the connection

RESPOND WITH VALID JSON ONLY:
{
  "connection": "2-3 sentences",
  "communication": "2-3 sentences",
  "tension": "2-3 sentences",
  "advice": "1-2 sentences — specific and actionable",
  "weekTheme": "short label summarizing the week energy, max 50 chars"
}`

      const client = new Anthropic({ apiKey: process.env.NUXT_ANTHROPIC_API_KEY ?? '' })

      const message = await withAiRetry(`weekly-transit-worker:${email}`, () =>
        client.messages.parse({
          model:      'claude-sonnet-4-6',
          max_tokens: 1200,
          system:     `You are writing a weekly relationship weather forecast for a specific couple. You know their chart data and their compatibility challenge. Ground everything in this week's actual planetary movements. Be specific to this pairing — never generic. Write in second person ('your connection', 'between you two'). 2-3 sentences per section. Warm but honest.`,
          messages:   [{ role: 'user', content: weeklyPrompt }],
          output_config: { format: jsonSchemaOutputFormat(weeklyTransitJsonSchema) },
        }),
      )

      const rawParsed = message.parsed_output
      if (!rawParsed) {
        const firstBlock = message.content[0]
        const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''
        console.error('[weekly-transit-worker] Structured output null', {
          email,
          weekStart,
          rawResponsePreview: (rawText || '').slice(0, 300),
        })
        throw new Error(`Claude returned null parsed_output for weekly transit: ${email}`)
      }

      const zodResult = WeeklyTransitSchema.safeParse(rawParsed)
      if (!zodResult.success) {
        console.error('[weekly-transit-worker] Schema validation failed', {
          email,
          weekStart,
          zodErrors: zodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        })
        throw new Error(`WeeklyTransitSchema validation failed for ${email}: ${zodResult.error.issues[0]?.message ?? 'unknown'}`)
      }

      const result: WeeklyTransitType & {
        person2SunSign:      string
        compatibilityTitle:  string
      } = {
        ...zodResult.data,
        person2SunSign,
        compatibilityTitle,
      }

      return result
    })

    // ── Step 4: Send email via /api/send-weekly-transit ───────────────────────
    // Strategy B: HTTP call with x-job-secret.
    // send-weekly-transit.post.ts uses useRuntimeConfig(), getHeader(), readBody(),
    // sanitizeString(), assertInput(), isValidEmail() — all Nuxt/H3 auto-imports
    // unavailable outside H3 event handlers. Identical coupling to Phase 4's
    // send-daily-insight pattern. HTTP call is correct and consistent.
    await step.run('send-email', async () => {
      const jobSecret = process.env.NUXT_EMAIL_JOB_SECRET ?? ''
      const siteUrl   = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://omenora.com'
      const baseUrl   = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`

      const result = await fetch(`${baseUrl}/api/send-weekly-transit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-job-secret': jobSecret },
        body: JSON.stringify({
          email,
          firstName,
          weekStart,
          weekEnd,
          weekTheme:        generated.weekTheme,
          connection:       generated.connection,
          communication:    generated.communication,
          tension:          generated.tension,
          advice:           generated.advice,
          person2SunSign:   generated.person2SunSign,
          compatibilityTitle: generated.compatibilityTitle,
        }),
      })

      if (!result.ok) {
        const text = await result.text()
        throw new Error(`send-weekly-transit failed (${result.status}): ${text.slice(0, 200)}`)
      }

      console.info(`[weekly-transit-worker] Email sent for ${email} week ${weekStart}`)
      return { sent: true }
    })

    // ── Step 5: Log send to email_send_log ────────────────────────────────────
    // ON CONFLICT DO NOTHING — safe under retry. No dual-write needed: the
    // Railway cron (send-weekly-transits.post.ts) has no shared log table.
    // Inngest idempotency key (email + weekStart) prevents the worker from
    // running twice for the same subscriber in the same week.
    await step.run('log-send', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { error } = await supabase
        .from('email_send_log')
        .upsert(
          {
            email,
            send_type:       'weekly_transit',
            send_date:       weekStart,
            resend_email_id: null,
          },
          { onConflict: 'email,send_type,send_date', ignoreDuplicates: true },
        )

      if (error) {
        console.error('[weekly-transit-worker] email_send_log upsert error:', error.code, error.message)
        throw new Error(`email_send_log upsert failed: ${error.message}`)
      }

      console.info(`[weekly-transit-worker] Logged send for ${email} week ${weekStart}`)
      return { logged: true }
    })

    return { ok: true, email, weekStart }
  },
)
