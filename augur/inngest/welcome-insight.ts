/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import { inngest, subscriberWelcomeSend } from './client'

/**
 * Welcome insight Inngest function.
 *
 * Triggered by the `subscriber/welcome.send` event (fired from the Stripe webhook
 * in Prompt 4). Generates a personalised daily insight via Claude and sends it
 * via Resend — the same work the webhook does today, but durably with retries.
 *
 * Steps:
 *   1. generate  — calls /api/generate-daily-insight (Claude)
 *   2. send      — calls /api/send-daily-insight (Resend) → returns Resend email ID
 *   3. audit     — inserts a row into email_send_log (idempotent via ON CONFLICT DO NOTHING)
 *
 * Strategy B: calls existing HTTP endpoints using the x-job-secret auth pattern.
 * Rationale: generate-daily-insight writes to daily_insight_logs as a side effect
 * and reads from it for theme dedup — extracting only the Claude call would require
 * entangling those DB operations. Calling the endpoint over HTTP is safer and leaves
 * the existing daily cron flow completely untouched.
 */
export const welcomeInsight = inngest.createFunction(
  {
    id: 'welcome-insight',
    name: 'Welcome Insight — generate and send on subscription',
    triggers: [{ event: subscriberWelcomeSend }],
    retries: 4,
    concurrency: {
      scope: 'account',
      key:   '"anthropic-api"',
      limit: 5,
    },
  },
  async ({ event, step }) => {
    const { email, firstName, archetype, lifePathNumber, element, region, sessionId } = event.data

    const jobSecret  = process.env.NUXT_EMAIL_JOB_SECRET ?? ''
    const siteUrl    = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://omenora.com'
    const baseUrl    = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
    // Use event.ts (ms since epoch, set at send time) so targetDate is stable
    // across Inngest replays — if a retry happens on a different calendar day the
    // email_send_log unique constraint (email, send_type, send_date) still deduplicates
    // against the original send date rather than inserting a second row.
    const targetDate = new Date(event.ts ?? Date.now()).toISOString().split('T')[0] as string

    // ── Step 1: Generate the welcome insight content via Claude ─────────────
    const insight = await step.run('generate-insight', async () => {
      const result = await fetch(`${baseUrl}/api/generate-daily-insight`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-job-secret': jobSecret },
        body:    JSON.stringify({
          email,
          firstName,
          archetype,
          lifePathNumber,
          element:    element || 'Earth',
          region:     region  || 'western',
          targetDate,
          language:   'en',
        }),
      })

      if (!result.ok) {
        const text = await result.text()
        throw new Error(`generate-daily-insight failed (${result.status}): ${text.slice(0, 200)}`)
      }

      const body = await result.json() as { success: boolean; insight: Record<string, unknown> }

      if (!body.success || !body.insight) {
        throw new Error('generate-daily-insight returned success=false or missing insight')
      }

      return body.insight
    })

    // ── Step 2: Send the email via Resend ────────────────────────────────────
    const resendEmailId = await step.run('send-email', async () => {
      const result = await fetch(`${baseUrl}/api/send-daily-insight`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-job-secret': jobSecret },
        body:    JSON.stringify({ email, firstName, archetype, insight }),
      })

      if (!result.ok) {
        const text = await result.text()
        throw new Error(`send-daily-insight failed (${result.status}): ${text.slice(0, 200)}`)
      }

      const body = await result.json() as { success: boolean; emailId?: string }
      return body.emailId ?? null
    })

    // ── Step 3: Insert audit row into email_send_log ─────────────────────────
    // ON CONFLICT DO NOTHING via ignoreDuplicates — safe to retry; the unique
    // constraint (email, send_type, send_date) enforces exactly-once at DB level.
    await step.run('audit-log', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL     ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { error } = await supabase
        .from('email_send_log')
        .upsert(
          {
            email,
            send_type:       'welcome_insight',
            send_date:       targetDate,
            resend_email_id: resendEmailId ?? null,
          },
          { onConflict: 'email,send_type,send_date', ignoreDuplicates: true },
        )

      if (error) {
        console.error('[welcome-insight] audit-log upsert error:', error.code, error.message)
        throw new Error(`email_send_log upsert failed: ${error.message}`)
      }

      return { logged: true }
    })

    return { ok: true, email, sessionId, resendEmailId }
  },
)
