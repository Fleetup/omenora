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
      'id, session_id, first_name, archetype, life_path_number, report_data, region, date_of_birth, created_at',
    )
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[me/reports] Fetch error:', error.code)
    throw createError({ statusCode: 500, message: 'Failed to load reports' })
  }

  return { reports: data ?? [] }
})
