/**
 * POST /api/get-daily-cache
 *
 * Public endpoint. Returns all 12 archetypes' and 12 zodiac signs' cached
 * daily content for a given date and language.
 *
 * Only returns today's data when BOTH caches are fully generated (>=12 rows
 * each). If today is incomplete (generation still running), falls back to
 * yesterday's complete cache to avoid serving partial data.
 *
 * Body (all optional):
 *   date     {string}  YYYY-MM-DD — defaults to today (UTC)
 *   language {string}  defaults to 'en'
 *
 * Returns:
 *   { success: true, date: string, isYesterday: boolean,
 *     archetypes: Record<string, object> | null,
 *     zodiac:     Record<string, object> | null }
 */

// ── Response shape types ────────────────────────────────────────────────────
type ArchetypeRow = {
  archetype:           string
  theme:               string
  insight:             string
  reflection_question: string
  moon_phase:          string
}

type ZodiacRow = {
  zodiac_sign:       string
  horoscope:         string
  love:              string
  job:               string
  health:            string
  theme:             string
  moon_phase:        string
  sun_sign:          string
  moon_sign:         string
  planetary_weather: string
}

function buildArchetypeMap(rows: ArchetypeRow[] | null) {
  if (!rows || rows.length === 0) return null
  const map: Record<string, { theme: string; insight: string; reflection: string; moon_phase: string }> = {}
  for (const row of rows) {
    map[row.archetype] = {
      theme:      row.theme,
      insight:    row.insight,
      reflection: row.reflection_question,
      moon_phase: row.moon_phase,
    }
  }
  return map
}

function buildZodiacMap(rows: ZodiacRow[] | null) {
  if (!rows || rows.length === 0) return null
  const map: Record<string, { horoscope: string; love: string; job: string; health: string; theme: string; moon_phase: string; sun_sign: string; moon_sign: string; planetary_weather: string }> = {}
  for (const row of rows) {
    map[row.zodiac_sign.toLowerCase()] = {
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
  }
  return map
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const rawDate  = sanitizeString(body?.date     ?? '', 10)
  const language = sanitizeString(body?.language ?? 'en', 5)

  const cacheDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate
    : new Date().toISOString().split('T')[0]!

  const supabase = createSupabaseAdmin()

  // ── Query today's archetype and zodiac caches in parallel ───────────────────
  const [archetypeResult, zodiacResult] = await Promise.all([
    supabase
      .from('daily_archetype_cache')
      .select('archetype, theme, insight, reflection_question, moon_phase')
      .eq('cache_date', cacheDate)
      .eq('language', language),
    supabase
      .from('daily_zodiac_cache')
      .select('zodiac_sign, horoscope, love, job, health, theme, moon_phase, sun_sign, moon_sign, planetary_weather')
      .eq('cache_date', cacheDate)
      .eq('language', language),
  ])

  console.log('[get-daily-cache] today query:', {
    cacheDate,
    language,
    archetypeRows: archetypeResult.data?.length,
    zodiacRows:    zodiacResult.data?.length,
    archetypeErr:  archetypeResult.error?.message,
    zodiacErr:     zodiacResult.error?.message,
  })

  if (archetypeResult.error) {
    console.error('[get-daily-cache] Archetype query failed:', archetypeResult.error.code)
    throw createError({ statusCode: 500, message: 'Failed to load daily cache' })
  }

  // ── Only serve today's data when both caches are fully generated (>=12) ─────
  // Prevents returning partial data while generation is still running.
  const archetypeReady = (archetypeResult.data?.length ?? 0) >= 12
  const zodiacReady    = (zodiacResult.data?.length    ?? 0) >= 12

  if (archetypeReady && zodiacReady) {
    return {
      success:     true,
      date:        cacheDate,
      isYesterday: false,
      archetypes:  buildArchetypeMap(archetypeResult.data as ArchetypeRow[]),
      zodiac:      buildZodiacMap(zodiacResult.data as ZodiacRow[]),
    }
  }

  // ── Today incomplete — fall back to yesterday ───────────────────────────────
  const yesterdayDate = new Date(new Date(cacheDate).getTime() - 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]!

  console.log(`[get-daily-cache] today incomplete (archetypes: ${archetypeResult.data?.length ?? 0}/12, zodiac: ${zodiacResult.data?.length ?? 0}/12) — trying yesterday: ${yesterdayDate}`)

  const [yArchetypeResult, yZodiacResult] = await Promise.all([
    supabase
      .from('daily_archetype_cache')
      .select('archetype, theme, insight, reflection_question, moon_phase')
      .eq('cache_date', yesterdayDate)
      .eq('language', language),
    supabase
      .from('daily_zodiac_cache')
      .select('zodiac_sign, horoscope, love, job, health, theme, moon_phase, sun_sign, moon_sign, planetary_weather')
      .eq('cache_date', yesterdayDate)
      .eq('language', language),
  ])

  const yArchetypes = buildArchetypeMap(yArchetypeResult.data as ArchetypeRow[] | null)
  const yZodiac     = buildZodiacMap(yZodiacResult.data as ZodiacRow[] | null)

  if (!yArchetypes && !yZodiac) {
    console.warn('[get-daily-cache] both today and yesterday are empty — returning null')
    return { success: true, date: cacheDate, isYesterday: false, archetypes: null, zodiac: null }
  }

  console.log('[get-daily-cache] returning yesterday fallback:', yesterdayDate)
  return {
    success:     true,
    date:        yesterdayDate,
    isYesterday: true,
    archetypes:  yArchetypes,
    zodiac:      yZodiac,
  }
})
