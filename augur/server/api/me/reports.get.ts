/**
 * GET /api/me/reports
 *
 * Returns all reports belonging to the authenticated user.
 * Requires a valid Supabase Bearer token in the Authorization header.
 *
 * Works identically for web and mobile — both send:
 *   Authorization: Bearer <supabase_access_token>
 *
 * The user's email (from their verified Supabase Auth account) is used
 * to filter reports, so no user_id column migration is required.
 */
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Validate JWT — throws 401 if missing or invalid
  const user = await requireAuth(event)

  if (!user.email) {
    throw createError({ statusCode: 401, message: 'Authenticated user has no email' })
  }

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data, error } = await supabase
    .from('reports')
    .select(
      'id, session_id, first_name, archetype, life_path_number, report_data, region, date_of_birth, created_at, type, partner_name',
    )
    .eq('email', user.email)
    .not('session_id', 'like', 'compat_%') // exclude pre-payment tempId rows
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[me/reports] Fetch error:', error.code)
    throw createError({ statusCode: 500, message: 'Failed to load reports' })
  }

  // Deduplicate: for compatibility readings keep only one row per partner+dob pair;
  // for archetype readings keep only one row per date_of_birth+archetype pair.
  // Priority: paid cs_live_ rows always win over temp_/promo_ rows on collision.
  // We sort so paid rows appear first, then dedup keeps the first-seen winner.
  const rows = (data ?? []).slice().sort((a, b) => {
    const aPaid = a.session_id?.startsWith('cs_live_') || a.session_id?.startsWith('cs_test_') ? 0 : 1
    const bPaid = b.session_id?.startsWith('cs_live_') || b.session_id?.startsWith('cs_test_') ? 0 : 1
    if (aPaid !== bPaid) return aPaid - bPaid
    // Within same tier, keep most recent first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const seen = new Set<string>()
  const deduped = rows.filter((row) => {
    const key = row.type === 'compatibility'
      ? `compat:${(row.partner_name ?? '').toLowerCase().trim()}:${row.date_of_birth ?? ''}`
      : `archetype:${row.date_of_birth ?? ''}:${row.archetype ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Re-sort by date descending for display (most recent first)
  deduped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return { reports: deduped }
})
