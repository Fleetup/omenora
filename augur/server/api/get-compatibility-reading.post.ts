/**
 * POST /api/get-compatibility-reading
 *
 * Returns a saved compatibility reading from the reports table by session_id.
 * Used by the account history "View" button to reload a past reading without
 * re-generating it via AI or re-sending email.
 *
 * Auth: requires valid Supabase Bearer token — user must own the reading.
 */
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId = sanitizeString(body.sessionId ?? '', 200)
  assertInput(isValidSessionId(sessionId), 'Valid sessionId is required')

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
    .select('session_id, first_name, partner_name, partner_dob, compatibility_data, language, created_at')
    .eq('session_id', sessionId)
    .eq('email', user.email)
    .eq('type', 'compatibility')
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, message: 'Compatibility reading not found' })
  }

  if (!data.compatibility_data) {
    throw createError({ statusCode: 404, message: 'Reading data not available' })
  }

  return {
    reading: {
      session_id:         data.session_id,
      first_name:         data.first_name,
      partner_name:       data.partner_name,
      partner_dob:        data.partner_dob,
      compatibility_data: data.compatibility_data,
      language:           data.language,
      created_at:         data.created_at,
    },
  }
})
