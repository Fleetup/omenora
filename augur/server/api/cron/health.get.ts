/**
 * GET /api/cron/health
 *
 * Reports whether today's daily cache has been fully generated.
 * Returns HTTP 200 when both archetype and zodiac caches are complete
 * (12/12 rows each), 503 when generation is still in progress or failed.
 *
 * Safe to expose publicly — returns no sensitive data.
 * Monitor with UptimeRobot, Railway healthcheck, or any HTTP monitor.
 */

export default defineEventHandler(async (event) => {
  const supabase = createSupabaseAdmin()
  const today = new Date().toISOString().split('T')[0]!

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
  const allReady       = archetypeReady && zodiacReady

  setResponseStatus(event, allReady ? 200 : 503)

  return {
    date: today,
    archetypes: {
      count: archetypeCount,
      ready: archetypeReady,
    },
    zodiac: {
      count: zodiacCount,
      ready: zodiacReady,
    },
    allReady,
    message: allReady
      ? 'Daily cache complete'
      : `Cache incomplete — archetypes: ${archetypeCount}/12, zodiac: ${zodiacCount}/12`,
  }
})
