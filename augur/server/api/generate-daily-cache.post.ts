/**
 * POST /api/generate-daily-cache
 *
 * Pre-generates daily insight content for all 12 archetypes and stores the
 * results in the daily_archetype_cache table. Called once per day by the
 * Railway cron (6am UTC) independently of the zodiac job.
 *
 * This job handles archetypes ONLY. Zodiac signs are handled exclusively
 * by /api/generate-daily-horoscope (5am UTC cron) — do not call it from here.
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
    try {
      const supabase = createSupabaseAdmin()

      let generated = 0
      let skipped   = 0
      let failed    = 0

      for (const archetype of ARCHETYPES) {
        console.log('[daily-cache] Processing archetype:', archetype)

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

        console.log('[daily-cache] Completed archetype:', archetype, '— generated:', generated, 'skipped:', skipped, 'failed:', failed)
      }

      console.log(
        `[generate-daily-cache] First pass: generated=${generated} skipped=${skipped} failed=${failed} date=${targetDate} language=${language}`,
      )

      // ── Post-loop verification + retry ───────────────────────────────────────
      const { data: presentRows } = await supabase
        .from('daily_archetype_cache')
        .select('archetype')
        .eq('cache_date', targetDate)
        .eq('language', language)

      const presentArchetypes = new Set((presentRows ?? []).map((r: { archetype: string }) => r.archetype))
      const missingArchetypes = ARCHETYPES.filter(a => !presentArchetypes.has(a))
      const toRetry           = Array.from(new Set([...missingArchetypes]))

      if (toRetry.length > 0) {
        console.log(`[generate-daily-cache] Archetypes to retry: ${toRetry.join(', ')}`)

        for (const archetype of toRetry) {
          let succeeded = false
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`[generate-daily-cache] Retrying archetype ${archetype} attempt ${attempt}/3`)
            await new Promise(r => setTimeout(r, 2000))

            let retryResult: {
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
              retryResult = await $fetch('/api/generate-daily-insight', {
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
                `[generate-daily-cache] Retry generate-daily-insight failed for ${archetype} attempt ${attempt}:`,
                err?.message ?? err,
              )
              continue
            }

            if (!retryResult?.success || !retryResult.insight) {
              console.error(
                `[generate-daily-cache] Retry unexpected response shape for ${archetype} attempt ${attempt}`,
              )
              continue
            }

            const { insight: retryInsight } = retryResult

            const { error: retryUpsertErr } = await supabase
              .from('daily_archetype_cache')
              .upsert(
                {
                  archetype,
                  cache_date:          targetDate,
                  language,
                  insight:             retryInsight.insight,
                  reflection_question: retryInsight.reflection_question,
                  theme:               retryInsight.theme,
                  moon_phase:          retryInsight.moonPhase,
                  created_at:          new Date().toISOString(),
                },
                { onConflict: 'archetype,cache_date,language', ignoreDuplicates: true },
              )

            if (retryUpsertErr) {
              console.error(
                `[generate-daily-cache] Retry upsert failed for ${archetype} attempt ${attempt}:`,
                retryUpsertErr.code,
              )
              continue
            }

            succeeded = true
            console.log(`[generate-daily-cache] Retry succeeded for ${archetype} on attempt ${attempt}`)
            break
          }

          if (!succeeded) {
            console.error(`[generate-daily-cache] All 3 retry attempts failed for archetype ${archetype}`)
          }
        }
      }

      // ── Final verification query ──────────────────────────────────────────────
      const { data: finalRows } = await supabase
        .from('daily_archetype_cache')
        .select('archetype')
        .eq('cache_date', targetDate)
        .eq('language', language)

      const finalPresent   = new Set((finalRows ?? []).map((r: { archetype: string }) => r.archetype))
      const finalConfirmed = ARCHETYPES.filter(a => finalPresent.has(a))
      const finalFailed    = ARCHETYPES.filter(a => !finalPresent.has(a))

      console.log(`[generate-daily-cache] FINAL STATUS — date: ${targetDate}`)
      console.log(`[generate-daily-cache] Archetypes confirmed in DB: ${finalConfirmed.join(', ')}`)
      console.log(`[generate-daily-cache] Permanently failed: ${finalFailed.length > 0 ? finalFailed.join(', ') : 'none'}`)
    } catch (outerErr: any) {
      console.error('[daily-cache] Fatal background error:', outerErr?.message)
    }
  })

  return { success: true, message: 'Cache generation started', targetDate, language }
})
