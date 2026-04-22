/**
 * POST /api/get-daily-cache
 *
 * Public endpoint. Returns all 12 archetypes' cached daily insight data for a
 * given date and language from the daily_archetype_cache table.
 *
 * Body (all optional):
 *   date     {string}  YYYY-MM-DD — defaults to today (UTC)
 *   language {string}  defaults to 'en'
 *
 * Returns:
 *   { success: true, date: string, data: Record<string, object> | null }
 */

export default defineEventHandler(async (event) => {
  const config  = useRuntimeConfig()
  const body    = await readBody(event)

  const rawDate  = sanitizeString(body?.date     ?? '', 10)
  const language = sanitizeString(body?.language ?? 'en', 5)

  const cacheDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate
    : new Date().toISOString().split('T')[0]!

  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('daily_archetype_cache')
    .select('archetype, theme, insight, reflection_question, moon_phase')
    .eq('cache_date', cacheDate)
    .eq('language', language)

  console.log('[get-daily-cache] query:', { cacheDate, language, rowCount: data?.length, error: error?.message })

  if (error) {
    console.error('[get-daily-cache] Query failed:', error.code)
    throw createError({ statusCode: 500, message: 'Failed to load daily cache' })
  }

  if (!data || data.length === 0) {
    return { success: true, date: cacheDate, data: null }
  }

  const keyed: Record<string, {
    theme:               string
    insight:             string
    reflection:          string
    moon_phase:          string
  }> = {}

  for (const row of data) {
    keyed[row.archetype] = {
      theme:      row.theme,
      insight:    row.insight,
      reflection: row.reflection_question,
      moon_phase: row.moon_phase,
    }
  }

  return { success: true, date: cacheDate, data: keyed }
})
