/**
 * POST /api/process-daily-insights
 *
 * Reads active subscribers in batches and sends each one a personalized
 * daily insight email. Designed to be called repeatedly by a Railway cron
 * (e.g. every 5 minutes) until the full subscriber list is processed.
 *
 * Reads insight content from the pre-built daily_archetype_cache table
 * instead of calling Claude live per subscriber. If the cache is not yet
 * ready for a subscriber's archetype, that subscriber is skipped (not failed)
 * — the next cron invocation will pick them up once the cache is ready.
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

import { getPlanetaryTransits } from '~~/server/utils/planetaryTransits'

const BATCH_SIZE = 20

// ── Subject line rotation (mirrors generate-daily-insight logic) ─────────────
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

  // ── Pre-compute shared planetary data for today ─────────────────────────────
  const transits      = getPlanetaryTransits(todayDate)
  const moonPhaseName = transits.moonPhaseName
  const dayTheme      = `${transits.sun.sign} season, Moon in ${transits.moon.sign}`

  const today        = new Date(todayDate)
  const startOfYear  = new Date(today.getFullYear(), 0, 0)
  const dayOfYear    = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
  const dateLabel    = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // ── Fetch today's archetype cache (all 12) once for the whole batch ─────────
  const { data: cacheRows, error: cacheErr } = await supabase
    .from('daily_archetype_cache')
    .select('archetype, insight, reflection_question, theme, moon_phase')
    .eq('cache_date', todayDate)
    .eq('language', 'en')

  if (cacheErr) {
    console.error('[process-daily-insights] Failed to fetch archetype cache:', cacheErr.code)
    throw createError({ statusCode: 500, message: 'Failed to fetch daily cache' })
  }

  const cacheByArchetype = new Map(
    (cacheRows ?? []).map(r => [r.archetype as string, r])
  )

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

  let sent          = 0
  let skipped       = 0
  let failed        = 0
  let cacheNotReady = 0

  for (const subscriber of subscribers) {
    const email     = (subscriber.email as string | null) ?? ''
    const firstName = (subscriber.first_name as string | null) || 'Friend'
    const archetype = (subscriber.archetype as string | null) ?? ''

    // ── Skip if already sent today (secondary guard after the set exclusion) ──
    if (alreadySentEmails.has(email)) {
      skipped++
      continue
    }

    // ── Read from pre-built cache — skip if not ready (do not call Claude) ────
    const cached = cacheByArchetype.get(archetype.toLowerCase())
    if (!cached) {
      console.warn(`[process-daily-insights] Cache not ready for archetype '${archetype}' — skipping ${email} (will retry next cron cycle)`)
      cacheNotReady++
      skipped++
      continue
    }

    // ── Build the insight object send-daily-insight expects ──────────────────
    const subjectLines = buildSubjectLines(firstName, archetype, dateLabel)
    const subject      = subjectLines[dayOfYear % subjectLines.length]!

    const insight = {
      moonPhase:           moonPhaseName,
      dayTheme,
      greeting:            `Good morning, ${firstName}.`,
      love:                cached.insight,
      work:                cached.insight,
      health:              cached.insight,
      reflection_question: cached.reflection_question as string,
      theme:               cached.theme as string,
      subject,
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
          insight,
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
    const { error: logErr } = await supabase
      .from('daily_insight_logs')
      .upsert(
        {
          subscriber_email:    email,
          sent_date:           todayDate,
          theme_used:          cached.theme,
          insight_preview:     (cached.insight as string).substring(0, 100),
          insight_full:        cached.insight,
          reflection_question: cached.reflection_question,
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

  console.log(`[process-daily-insights] date=${todayDate} sent=${sent} skipped=${skipped} failed=${failed} cacheNotReady=${cacheNotReady}`)

  return { success: true, sent, skipped, failed, cacheNotReady }
})
