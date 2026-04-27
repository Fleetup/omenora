/**
 * GET /api/me/daily-insights
 *
 * Returns the last 7 daily insight entries for the authenticated subscriber.
 * Requires a valid Supabase Bearer token in the Authorization header.
 *
 * Returns entries ordered most-recent-first. Entries with null insight_full
 * (sent before the column was added) are still returned — the client renders
 * insight_preview as a fallback.
 *
 * Only returns data for active subscribers — if the user is not in the
 * daily_insight_logs table, an empty array is returned (not an error).
 */

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (!user.email) {
    throw createError({ statusCode: 401, message: 'Authenticated user has no email' })
  }

  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('daily_insight_logs')
    .select('sent_date, theme_used, insight_preview, insight_full, reflection_question')
    .eq('subscriber_email', user.email)
    .order('sent_date', { ascending: false })
    .limit(7)

  if (error) {
    console.error('[me/daily-insights] Fetch error:', error.code)
    throw createError({ statusCode: 500, message: 'Failed to load daily insights' })
  }

  return { insights: data ?? [] }
})
