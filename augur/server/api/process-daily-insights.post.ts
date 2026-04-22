/**
 * POST /api/process-daily-insights
 *
 * Reads active subscribers in batches and sends each one a personalized
 * daily insight email. Designed to be called repeatedly by a Railway cron
 * (e.g. every 5 minutes) until the full subscriber list is processed.
 *
 * Skips any subscriber who already has a daily_insight_logs row for today.
 * Never throws mid-loop — all per-subscriber failures are counted and logged.
 *
 * Protected by a shared secret (NUXT_EMAIL_JOB_SECRET) so only Railway
 * cron can trigger it — not arbitrary internet callers.
 *
 * Railway cron config:
 *   schedule: "* /5 * * * *"   (every 5 minutes, after generate-daily-cache has run)
 *   command:  POST https://omenora.com/api/process-daily-insights
 *   headers:  { "x-job-secret": "$EMAIL_JOB_SECRET" }
 */

const BATCH_SIZE = 20

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only Railway cron may call this ────────────────────────────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const supabase  = createSupabaseAdmin()
  const todayDate = new Date().toISOString().split('T')[0]!

  // ── Fetch active subscribers not yet sent today ─────────────────────────────
  // Left-join approach: fetch subscribers whose email does NOT appear in
  // daily_insight_logs for today. Supabase does not support NOT EXISTS natively
  // in the client, so we fetch the sent-today set first, then exclude.
  const { data: sentToday, error: sentErr } = await supabase
    .from('daily_insight_logs')
    .select('subscriber_email')
    .eq('sent_date', todayDate)

  if (sentErr) {
    console.error('[process-daily-insights] Failed to fetch sent-today logs:', sentErr.code)
    throw createError({ statusCode: 500, message: 'Failed to fetch sent logs' })
  }

  const alreadySentEmails = new Set((sentToday ?? []).map((r: { subscriber_email: string }) => r.subscriber_email))

  const { data: subscribers, error: subErr } = await supabase
    .from('subscribers')
    .select('email, first_name, archetype, life_path_number, element, region')
    .eq('active', true)
    .order('email', { ascending: true })
    .limit(BATCH_SIZE)

  if (subErr) {
    console.error('[process-daily-insights] Failed to fetch subscribers:', subErr.code)
    throw createError({ statusCode: 500, message: 'Failed to fetch subscribers' })
  }

  if (!subscribers || subscribers.length === 0) {
    return { success: true, sent: 0, skipped: 0, failed: 0 }
  }

  let sent    = 0
  let skipped = 0
  let failed  = 0

  for (const subscriber of subscribers) {
    const email     = (subscriber.email as string | null) ?? ''
    const firstName = (subscriber.first_name as string | null) || 'Friend'
    const archetype = (subscriber.archetype as string | null) ?? ''
    const lifePathNumber = (subscriber.life_path_number as number | null) ?? 0
    const element   = (subscriber.element as string | null) ?? ''
    const region    = (subscriber.region as string | null) ?? 'western'

    // ── Skip if already sent today (secondary guard after the set exclusion) ──
    if (alreadySentEmails.has(email)) {
      skipped++
      continue
    }

    // ── Call generate-daily-insight ───────────────────────────────────────────
    let insightResult: {
      success: boolean
      insight: {
        insight:             string
        reflection_question: string
        theme:               string
        moonPhase:           string
        dayTheme:            string
        greeting:            string
        subject:             string
      }
    } | null = null

    try {
      insightResult = await $fetch('/api/generate-daily-insight', {
        method:  'POST',
        headers: { 'x-job-secret': expectedSecret },
        body: {
          firstName,
          archetype,
          lifePathNumber,
          element,
          region,
          email,
          targetDate: todayDate,
          language:   'en',
        },
      })
    } catch (err: any) {
      console.error(
        `[process-daily-insights] generate-daily-insight failed for ${email}:`,
        err?.message ?? err,
      )
      failed++
      continue
    }

    if (!insightResult?.success || !insightResult.insight) {
      console.error(
        `[process-daily-insights] Unexpected insight response shape for ${email}`,
        insightResult,
      )
      failed++
      continue
    }

    // ── Call send-daily-insight ───────────────────────────────────────────────
    try {
      await $fetch('/api/send-daily-insight', {
        method:  'POST',
        headers: { 'x-job-secret': expectedSecret },
        body: {
          email,
          firstName,
          archetype,
          insight: insightResult.insight,
        },
      })
    } catch (err: any) {
      console.error(
        `[process-daily-insights] send-daily-insight failed for ${email}:`,
        err?.message ?? err,
      )
      failed++
      continue
    }

    // ── Log the send ──────────────────────────────────────────────────────────
    const insightPreview = insightResult.insight.insight.substring(0, 100)
    const { error: logErr } = await supabase
      .from('daily_insight_logs')
      .upsert(
        {
          subscriber_email: email,
          sent_date:        todayDate,
          theme_used:       insightResult.insight.theme,
          insight_preview:  insightPreview,
        },
        { onConflict: 'subscriber_email,sent_date', ignoreDuplicates: true },
      )

    if (logErr) {
      console.error(
        `[process-daily-insights] Failed to log send for ${email}:`,
        logErr.code,
      )
      // Do not fail the counter — email was sent successfully
    }

    sent++
  }

  return { success: true, sent, skipped, failed }
})
