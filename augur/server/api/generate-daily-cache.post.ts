/**
 * POST /api/generate-daily-cache
 *
 * Pre-generates daily insight content for all 12 archetypes and stores the
 * results in the daily_archetype_cache table. Called once per day by the
 * Railway cron before the daily insight dispatcher runs, so each subscriber
 * receives a cached insight rather than triggering a live Claude call.
 *
 * Protected by a shared secret (NUXT_EMAIL_JOB_SECRET) so only Railway
 * cron can trigger it — not arbitrary internet callers.
 *
 * Railway cron config:
 *   schedule: "0 6 * * *"   (6:00 AM UTC daily)
 *   command:  POST https://omenora.com/api/generate-daily-cache
 *   headers:  { "x-job-secret": "$EMAIL_JOB_SECRET" }
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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only Railway cron may call this ────────────────────────────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const rawDate   = sanitizeString(body.targetDate ?? '', 10)
  const language  = sanitizeString(body.language || 'en', 5)
  const targetDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate
    : new Date().toISOString().split('T')[0]!

  // ── Return immediately — processing runs in the background ─────────────────
  setImmediate(async () => {
    const supabase = createSupabaseAdmin()

    let generated = 0
    let skipped   = 0
    let failed    = 0

    for (const archetype of ARCHETYPES) {
      // ── Check if cache row already exists for this (archetype, date, language) ─
      const { data: existing, error: existsErr } = await supabase
        .from('daily_archetype_cache')
        .select('id')
        .eq('archetype', archetype)
        .eq('cache_date', targetDate)
        .eq('language', language)
        .maybeSingle()

      if (existsErr) {
        console.error(
          `[generate-daily-cache] Existence check failed for ${archetype}:`,
          existsErr.code,
        )
        failed++
        continue
      }

      if (existing) {
        skipped++
        continue
      }

      // ── Call generate-daily-insight for this archetype ────────────────────────
      let insightResult: {
        success: boolean
        insight: {
          insight: string
          reflection_question: string
          theme: string
          moonPhase: string
          dayTheme: string
          greeting: string
          subject: string
        }
      } | null = null

      try {
        insightResult = await $fetch('/api/generate-daily-insight', {
          method:  'POST',
          headers: { 'x-job-secret': expectedSecret },
          body: {
            firstName:      'Friend',
            archetype,
            lifePathNumber: 5,
            targetDate,
            language,
          },
        })
      } catch (err: any) {
        console.error(
          `[generate-daily-cache] generate-daily-insight failed for ${archetype}:`,
          err?.message ?? err,
        )
        failed++
        continue
      }

      if (!insightResult?.success || !insightResult.insight) {
        console.error(
          `[generate-daily-cache] Unexpected response shape for ${archetype}`,
          insightResult,
        )
        failed++
        continue
      }

      const { insight } = insightResult

      // ── Upsert into daily_archetype_cache ─────────────────────────────────────
      const { error: upsertErr } = await supabase
        .from('daily_archetype_cache')
        .upsert(
          {
            archetype,
            cache_date:          targetDate,
            language,
            insight:             insight.insight,
            reflection_question: insight.reflection_question,
            theme:               insight.theme,
            moon_phase:          insight.moonPhase,
            created_at:          new Date().toISOString(),
          },
          { onConflict: 'archetype,cache_date,language', ignoreDuplicates: true },
        )

      if (upsertErr) {
        console.error(
          `[generate-daily-cache] Upsert failed for ${archetype}:`,
          upsertErr.code,
        )
        failed++
        continue
      }

      generated++
    }

    console.log(
      `[generate-daily-cache] Completed: generated=${generated} skipped=${skipped} failed=${failed} date=${targetDate} language=${language}`,
    )
  })

  return { success: true, message: 'Cache generation started', targetDate, language }
})
