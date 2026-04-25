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
    // ── Fallback: try yesterday's cache before returning null ─────────────────
    const yesterdayDate = new Date(new Date(cacheDate).getTime() - 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]!

    console.log('[get-daily-cache] today empty — trying yesterday:', yesterdayDate)

    const { data: yData, error: yError } = await supabase
      .from('daily_archetype_cache')
      .select('archetype, theme, insight, reflection_question, moon_phase')
      .eq('cache_date', yesterdayDate)
      .eq('language', language)

    if (yError || !yData || yData.length === 0) {
      return { success: true, date: cacheDate, data: null }
    }

    const yKeyed: Record<string, { theme: string; insight: string; reflection: string; moon_phase: string }> = {}
    for (const row of yData) {
      yKeyed[row.archetype] = {
        theme:      row.theme,
        insight:    row.insight,
        reflection: row.reflection_question,
        moon_phase: row.moon_phase,
      }
    }

    const { data: yZodiacData } = await supabase
      .from('daily_zodiac_cache')
      .select('zodiac_sign, horoscope, love, job, health, theme, moon_phase, sun_sign, moon_sign, planetary_weather')
      .eq('cache_date', yesterdayDate)
      .eq('language', language)

    const yZodiacKeyed: Record<string, { horoscope: string; love: string; job: string; health: string; theme: string; moon_phase: string; sun_sign: string; moon_sign: string; planetary_weather: string }> | null =
      yZodiacData && yZodiacData.length > 0
        ? yZodiacData.reduce((acc, row) => {
            acc[row.zodiac_sign.toLowerCase()] = {
              horoscope:         row.horoscope,
              love:              row.love,
              job:               row.job,
              health:            row.health,
              theme:             row.theme,
              moon_phase:        row.moon_phase,
              sun_sign:          row.sun_sign,
              moon_sign:         row.moon_sign,
              planetary_weather: row.planetary_weather,
            }
            return acc
          }, {} as Record<string, { horoscope: string; love: string; job: string; health: string; theme: string; moon_phase: string; sun_sign: string; moon_sign: string; planetary_weather: string }>)
        : null

    console.log('[get-daily-cache] returning yesterday fallback:', yesterdayDate)
    return { success: true, date: yesterdayDate, archetypes: yKeyed, zodiac: yZodiacKeyed }
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

  const { data: zodiacData, error: zodiacError } = await supabase
    .from('daily_zodiac_cache')
    .select('zodiac_sign, horoscope, love, job, health, theme, moon_phase, sun_sign, moon_sign, planetary_weather')
    .eq('cache_date', cacheDate)
    .eq('language', language)

  console.log('[get-daily-cache] zodiac query:', { rowCount: zodiacData?.length, error: zodiacError?.message })

  const zodiacKeyed: Record<string, {
    horoscope:         string
    love:              string
    job:               string
    health:            string
    theme:             string
    moon_phase:        string
    sun_sign:          string
    moon_sign:         string
    planetary_weather: string
  }> | null = zodiacData && zodiacData.length > 0
    ? zodiacData.reduce((acc, row) => {
        acc[row.zodiac_sign.toLowerCase()] = {
          horoscope:         row.horoscope,
          love:              row.love,
          job:               row.job,
          health:            row.health,
          theme:             row.theme,
          moon_phase:        row.moon_phase,
          sun_sign:          row.sun_sign,
          moon_sign:         row.moon_sign,
          planetary_weather: row.planetary_weather,
        }
        return acc
      }, {} as Record<string, { horoscope: string; love: string; job: string; health: string; theme: string; moon_phase: string; sun_sign: string; moon_sign: string; planetary_weather: string }>)
    : null

  return { success: true, date: cacheDate, archetypes: keyed, zodiac: zodiacKeyed }
})
