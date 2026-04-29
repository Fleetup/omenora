/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import { inngest, insightDailyInsightSend } from './client'

/**
 * Daily insight delivery Inngest functions (orchestrator + worker).
 *
 * dailyInsightOrchestrator — cron at 0 7 * * * (7:00 AM UTC daily)
 *   Fetches ALL active, non-suppressed subscribers (no LIMIT, no order-by email).
 *   Fans out one insight/daily-insight.send event per subscriber in batches of
 *   5000 (Inngest inngest.send limit per call). Derives targetDate from
 *   event.ts — stable across retries.
 *
 * dailyInsightWorker — triggered by insight/daily-insight.send
 *   Step 1: dual dedup check — email_send_log AND daily_insight_logs (catches
 *           sends by the old Railway cron during parallel-run overlap).
 *           Returns {skipped: true} if already sent.
 *   Step 2: fetch daily_archetype_cache for (archetype, targetDate). Requires
 *           love, work, health, reflection columns to be non-null. If cache is
 *           not ready, throws "cache-not-ready" — Inngest retries with backoff.
 *   Step 3: send email via /api/send-daily-insight (Strategy B — HTTP with
 *           x-job-secret). This is the same pattern as welcome-insight.ts and
 *           avoids H3 context issues (useRuntimeConfig, sanitizeString, etc.).
 *   Step 4: dual-write to email_send_log AND daily_insight_logs (ON CONFLICT
 *           DO NOTHING). The daily_insight_logs write is the dedup bridge — the
 *           old Railway cron checks this table and skips subscribers already logged.
 *
 * Concurrency: account-scoped "resend-api" key, limit 10.
 * Retries: 4.
 * Idempotency: email + targetDate (one send per subscriber per day).
 *
 * Issue B2 fix: orchestrator fetches ALL active subscribers (no LIMIT/OFFSET),
 * eliminating the first-20-alphabetical truncation of the old Railway cron.
 * Issue B3 fix: worker reads love, work, health individually from cache columns,
 * not the combined insight blob.
 */

const INNGEST_SEND_BATCH = 5000

// ── Orchestrator ─────────────────────────────────────────────────────────────

export const dailyInsightOrchestrator = inngest.createFunction(
  {
    id:      'daily-insight-orchestrator',
    name:    'Daily Insight — fan-out all subscribers (7 AM UTC)',
    triggers: [{ cron: '0 7 * * *' }],
    retries: 2,
  },
  async ({ event, step }) => {
    // Derive targetDate from cron event timestamp — stable across retries.
    const targetDate = new Date(event.ts).toISOString().split('T')[0] as string

    const { subscriberEvents, totalSubscribers } = await step.run('fetch-and-fan-out', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      // ── 1. Fetch suppressed emails ────────────────────────────────────────
      // Filter in the orchestrator so suppressed addresses never get a
      // worker run at all — per Phase 4 constraint.
      const { data: suppressedRows, error: suppErr } = await supabase
        .from('email_suppression')
        .select('email')

      if (suppErr) {
        console.error('[daily-insight-orchestrator] Failed to fetch suppression list:', suppErr.code, suppErr.message)
        throw new Error(`email_suppression fetch failed: ${suppErr.message}`)
      }

      const suppressedEmails = new Set(
        (suppressedRows ?? []).map((r: { email: string }) => r.email.toLowerCase().trim()),
      )

      // ── 2. Fetch ALL active subscribers (no LIMIT) ────────────────────────
      // Use range-based pagination to avoid Supabase's default 1000-row cap.
      // PostgREST returns at most 1000 rows per request without a range header;
      // we page in 1000-row chunks until we get fewer than 1000 back.
      const allSubscribers: Array<{
        email:      string
        first_name: string | null
        archetype:  string | null
      }> = []

      let rangeFrom    = 0
      const PAGE       = 1000
      let hasMorePages = true

      while (hasMorePages) {
        const { data: page, error: pageErr } = await supabase
          .from('subscribers')
          .select('email, first_name, archetype')
          .eq('active', true)
          .range(rangeFrom, rangeFrom + PAGE - 1)

        if (pageErr) {
          console.error('[daily-insight-orchestrator] Subscriber page fetch failed:', pageErr.code, pageErr.message)
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

      // ── 3. Filter out suppressed addresses ───────────────────────────────
      const eligible = allSubscribers.filter(
        s => s.email && !suppressedEmails.has(s.email.toLowerCase().trim()),
      )

      console.info(
        `[daily-insight-orchestrator] ${targetDate}: total=${allSubscribers.length} suppressed=${suppressedEmails.size} eligible=${eligible.length}`,
      )

      // ── 4. Fan out events in batches of INNGEST_SEND_BATCH ────────────────
      const eventPayloads = eligible.map(s =>
        insightDailyInsightSend.create({
          email:      s.email,
          firstName:  (s.first_name ?? '') || 'Friend',
          archetype:  (s.archetype ?? '').toLowerCase().trim(),
          targetDate,
        }),
      )

      for (let i = 0; i < eventPayloads.length; i += INNGEST_SEND_BATCH) {
        const batch = eventPayloads.slice(i, i + INNGEST_SEND_BATCH)
        await inngest.send(batch)
        console.info(
          `[daily-insight-orchestrator] Sent batch ${Math.floor(i / INNGEST_SEND_BATCH) + 1}: ${batch.length} events`,
        )
      }

      return { subscriberEvents: eligible.length, totalSubscribers: allSubscribers.length }
    })

    console.info(
      `[daily-insight-orchestrator] Fan-out complete for ${targetDate}: ${subscriberEvents} events sent (${totalSubscribers} total active, suppressed filtered)`,
    )

    return { ok: true, targetDate, subscriberEvents, totalSubscribers }
  },
)

// ── Worker ────────────────────────────────────────────────────────────────────

export const dailyInsightWorker = inngest.createFunction(
  {
    id:      'daily-insight-worker',
    name:    'Daily Insight — send one subscriber',
    triggers: [{ event: insightDailyInsightSend }],
    retries: 4,
    concurrency: {
      scope: 'account',
      key:   '"resend-api"',
      limit: 10,
    },
    idempotency: 'event.data.email + "-" + event.data.targetDate',
  },
  async ({ event, step }) => {
    const { email, firstName, archetype, targetDate } = event.data

    // ── Step 1: Dual dedup check ──────────────────────────────────────────────
    // Checks both email_send_log (Inngest-native) and daily_insight_logs
    // (legacy Railway cron table). Either hit means already sent today.
    const alreadySent = await step.run('dedup-check', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const [sendLogResult, insightLogResult] = await Promise.all([
        supabase
          .from('email_send_log')
          .select('id')
          .eq('email', email)
          .eq('send_type', 'daily_insight')
          .eq('send_date', targetDate)
          .maybeSingle(),
        supabase
          .from('daily_insight_logs')
          .select('subscriber_email')
          .eq('subscriber_email', email)
          .eq('sent_date', targetDate)
          .maybeSingle(),
      ])

      if (sendLogResult.error) {
        console.error('[daily-insight-worker] email_send_log dedup check error:', sendLogResult.error.code)
        throw new Error(`email_send_log dedup check failed: ${sendLogResult.error.message}`)
      }
      if (insightLogResult.error) {
        console.error('[daily-insight-worker] daily_insight_logs dedup check error:', insightLogResult.error.code)
        throw new Error(`daily_insight_logs dedup check failed: ${insightLogResult.error.message}`)
      }

      return !!(sendLogResult.data || insightLogResult.data)
    })

    if (alreadySent) {
      console.info(`[daily-insight-worker] Already sent for ${email} on ${targetDate} — skipping`)
      return { skipped: true, email, targetDate }
    }

    // ── Step 2: Fetch archetype cache ─────────────────────────────────────────
    // Reads love, work, health, reflection from the Phase 3 Inngest-populated
    // columns. If any is null the cache is not ready — throws so Inngest retries.
    const cached = await step.run('fetch-cache', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { data, error } = await supabase
        .from('daily_archetype_cache')
        .select('love, work, health, reflection, reflection_question, theme, moon_phase')
        .eq('archetype', archetype)
        .eq('cache_date', targetDate)
        .eq('language', 'en')
        .maybeSingle()

      if (error) {
        console.error(`[daily-insight-worker] Cache fetch error for ${archetype}:`, error.code, error.message)
        throw new Error(`daily_archetype_cache fetch failed for ${archetype}: ${error.message}`)
      }

      if (!data || !data.love || !data.work || !data.health || !data.reflection) {
        // Throw a specific error so the retry logs are identifiable.
        // After 4 retries this surfaces in the Inngest dashboard for inspection.
        console.warn(`[daily-insight-worker] Cache not ready for archetype=${archetype} date=${targetDate} — will retry`)
        throw new Error(`cache-not-ready: archetype=${archetype} date=${targetDate}`)
      }

      return data as {
        love:                string
        work:                string
        health:              string
        reflection:          string
        reflection_question: string | null
        theme:               string
        moon_phase:          string
      }
    })

    // ── Step 3: Send email via /api/send-daily-insight ────────────────────────
    // Strategy B: HTTP call with x-job-secret, matching welcome-insight.ts.
    // send-daily-insight uses useRuntimeConfig() and Nuxt auto-imports which are
    // only available inside H3 event handlers — calling over HTTP is correct.
    //
    // Build the insight object send-daily-insight expects. Use the separate
    // love/work/health columns — this is what fixes Issue B3.
    await step.run('send-email', async () => {
      const jobSecret = process.env.NUXT_EMAIL_JOB_SECRET ?? ''
      const siteUrl   = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://omenora.com'
      const baseUrl   = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`

      const today       = new Date(`${targetDate}T12:00:00Z`)
      const startOfYear = new Date(today.getFullYear(), 0, 0)
      const dayOfYear   = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
      const dateLabel   = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
      })

      const moonPhaseName = cached.moon_phase || ''
      const dayTheme      = cached.theme || ''

      const subjectLines = buildSubjectLines(firstName, archetype, dateLabel)
      const subject      = subjectLines[dayOfYear % subjectLines.length]!

      const insight = {
        moonPhase:           moonPhaseName,
        dayTheme,
        greeting:            `Good morning, ${firstName}.`,
        love:                cached.love,
        work:                cached.work,
        health:              cached.health,
        reflection_question: cached.reflection || cached.reflection_question || '',
        subject,
      }

      const result = await fetch(`${baseUrl}/api/send-daily-insight`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-job-secret': jobSecret },
        body:    JSON.stringify({ email, firstName, archetype, insight }),
      })

      if (!result.ok) {
        const text = await result.text()
        throw new Error(`send-daily-insight failed (${result.status}): ${text.slice(0, 200)}`)
      }

      console.info(`[daily-insight-worker] Email sent for ${email} on ${targetDate}`)
      return { sent: true }
    })

    // ── Step 4: Dual-write to email_send_log and daily_insight_logs ───────────
    // Both writes use ON CONFLICT DO NOTHING (ignoreDuplicates) — safe under
    // retry. The daily_insight_logs write is the dedup bridge: the Railway cron
    // (process-daily-insights.post.ts) checks this table and skips subscribers
    // that already have a row for today, preventing double-sends during
    // the parallel-run overlap period before the cron is disabled.
    await step.run('dual-write-log', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const [sendLogResult, insightLogResult] = await Promise.all([
        supabase
          .from('email_send_log')
          .upsert(
            {
              email,
              send_type:       'daily_insight',
              send_date:       targetDate,
              resend_email_id: null,
            },
            { onConflict: 'email,send_type,send_date', ignoreDuplicates: true },
          ),
        supabase
          .from('daily_insight_logs')
          .upsert(
            {
              subscriber_email:    email,
              sent_date:           targetDate,
              theme_used:          cached.theme || '',
              insight_preview:     cached.love.substring(0, 100),
              insight_full:        `${cached.love}\n\n${cached.work}\n\n${cached.health}`,
              reflection_question: cached.reflection || cached.reflection_question || '',
            },
            { onConflict: 'subscriber_email,sent_date', ignoreDuplicates: true },
          ),
      ])

      if (sendLogResult.error) {
        console.error('[daily-insight-worker] email_send_log write error:', sendLogResult.error.code, sendLogResult.error.message)
        throw new Error(`email_send_log upsert failed: ${sendLogResult.error.message}`)
      }
      if (insightLogResult.error) {
        console.error('[daily-insight-worker] daily_insight_logs write error:', insightLogResult.error.code, insightLogResult.error.message)
        throw new Error(`daily_insight_logs upsert failed: ${insightLogResult.error.message}`)
      }

      console.info(`[daily-insight-worker] Dual-write logged for ${email} on ${targetDate}`)
      return { logged: true }
    })

    return { ok: true, email, archetype, targetDate }
  },
)

// ── Subject line rotation (mirrors process-daily-insights.post.ts) ────────────
// Kept in this file to avoid importing from a Nuxt API route; the logic is
// deterministic and has no side effects.
function buildSubjectLines(firstName: string, archetype: string, dateLabel: string): string[] {
  return [
    `Your insight for today, ${firstName}`,
    `${firstName} — something to sit with today`,
    `Today's reflection for the ${archetype}`,
    `${firstName}, this is for you today`,
    `A thought for ${dateLabel.split(',')[0]}`,
    `Your ${archetype} energy today`,
    `${firstName} — today's lens`,
    `What today holds for the ${archetype}`,
    `For you today, ${firstName}`,
    `${firstName} — worth reading this morning`,
    `Today's ${archetype} insight`,
    `A moment of reflection, ${firstName}`,
    `${firstName} — your daily reading`,
    `What the ${archetype} notices today`,
    `Today's thought for ${firstName}`,
  ]
}
