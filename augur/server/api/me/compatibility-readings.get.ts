/**
 * GET /api/me/compatibility-readings
 *
 * Returns the last 10 compatibility readings belonging to the authenticated user.
 * Requires a valid Supabase Bearer token in the Authorization header.
 *
 * Output: { readings: ReadingItem[] }
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
    .select('id, session_id, partner_name, partner_dob, compatibility_data, created_at, email')
    .eq('email', user.email)
    .eq('type', 'compatibility')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('[me/compatibility-readings] Fetch error:', error.code, error.message)
    return { readings: [] }
  }

  const readings = (data ?? []).map((row) => {
    const cd = row.compatibility_data as Record<string, any> | null

    const score: number | null
      = cd && typeof cd.compatibilityScore === 'number' ? cd.compatibilityScore : null

    const title: string | null
      = cd && typeof cd.compatibilityTitle === 'string' && cd.compatibilityTitle
        ? cd.compatibilityTitle
        : null

    const partnerName: string | null
      = typeof row.partner_name === 'string' && row.partner_name.trim() !== ''
        ? row.partner_name
        : null

    return {
      id:          row.id as string,
      sessionId:   row.session_id as string,
      partnerName,
      partnerDob:  (row.partner_dob as string | null) ?? null,
      score,
      title,
      createdAt:   row.created_at as string,
    }
  })

  return { readings }
})
