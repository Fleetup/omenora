/**
 * server/plugins/daily-cache-warmup.ts
 *
 * Nitro server plugin — runs once per server boot.
 *
 * Problem it solves:
 *   Railway redeploys kill any in-flight setImmediate background jobs
 *   (generate-daily-cache, generate-daily-horoscope). If a redeploy happens
 *   while those cron jobs are mid-run (or before they've run at all that day),
 *   today's daily_archetype_cache and daily_zodiac_cache stay incomplete.
 *   get-daily-cache then falls back to yesterday's data indefinitely.
 *
 * Fix:
 *   On every server boot, check whether today's cache is fully generated
 *   (>=12 rows in both tables). If either table is incomplete, fire the
 *   corresponding generation job in the background. Both generation endpoints
 *   are fully idempotent — they skip rows that already exist — so running
 *   them again after a partial run is always safe.
 *
 * Guards:
 *   - Only runs in production (NODE_ENV === 'production') to avoid burning
 *     AI credits on every dev hot-reload.
 *   - Module-level flag prevents double-firing in the same process.
 *   - 30-second startup delay gives Nitro time to finish binding routes before
 *     internal $fetch calls are made.
 *   - All errors are caught and logged — never throws, never blocks startup.
 */

let warmupFired = false

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production') return
  if (warmupFired) return
  warmupFired = true

  setImmediate(() => {
    setTimeout(() => {
      runWarmup().catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[daily-cache-warmup] Unhandled error in warmup runner:', msg)
      })
    }, 30_000)
  })
})

async function runWarmup(): Promise<void> {
  const config  = useRuntimeConfig()
  const jobSecret = (config.emailJobSecret as string | undefined) ?? ''

  if (!jobSecret) {
    console.warn('[daily-cache-warmup] emailJobSecret not configured — skipping warmup')
    return
  }

  const today = new Date().toISOString().split('T')[0]!

  console.log(`[daily-cache-warmup] Boot warmup starting for date: ${today}`)

  // ── Check current cache completeness ──────────────────────────────────────
  const supabase = createSupabaseAdmin()

  const [archetypeResult, zodiacResult] = await Promise.all([
    supabase
      .from('daily_archetype_cache')
      .select('*', { count: 'exact', head: true })
      .eq('cache_date', today)
      .eq('language', 'en'),
    supabase
      .from('daily_zodiac_cache')
      .select('*', { count: 'exact', head: true })
      .eq('cache_date', today)
      .eq('language', 'en'),
  ])

  const archetypeCount = archetypeResult.count ?? 0
  const zodiacCount    = zodiacResult.count    ?? 0
  const archetypeReady = archetypeCount >= 12
  const zodiacReady    = zodiacCount    >= 12

  console.log(`[daily-cache-warmup] Cache status — archetypes: ${archetypeCount}/12, zodiac: ${zodiacCount}/12`)

  if (archetypeReady && zodiacReady) {
    console.log('[daily-cache-warmup] Both caches complete — no warmup needed')
    return
  }

  // ── Fire incomplete jobs ───────────────────────────────────────────────────
  const jobs: Array<{ name: string; endpoint: string; needed: boolean }> = [
    { name: 'archetypes', endpoint: '/api/generate-daily-cache',      needed: !archetypeReady },
    { name: 'zodiac',     endpoint: '/api/generate-daily-horoscope',   needed: !zodiacReady    },
  ]

  for (const job of jobs) {
    if (!job.needed) {
      console.log(`[daily-cache-warmup] ${job.name} already complete — skipping`)
      continue
    }

    console.log(`[daily-cache-warmup] Triggering ${job.name} generation (${job.endpoint})`)

    try {
      await $fetch(job.endpoint, {
        method:  'POST',
        headers: { 'x-job-secret': jobSecret },
        body:    { targetDate: today, language: 'en' },
      })
      console.log(`[daily-cache-warmup] ${job.name} job accepted (running in background)`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[daily-cache-warmup] Failed to trigger ${job.name} job:`, msg)
    }
  }

  console.log('[daily-cache-warmup] Boot warmup complete')
}
