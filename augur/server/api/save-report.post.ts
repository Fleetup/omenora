import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId      = sanitizeString(body.sessionId, 200)
  const firstName      = sanitizeString(body.firstName, 50)
  const archetype      = sanitizeString(body.archetype, 30)
  const lifePathNumber = body.lifePathNumber !== undefined ? Number(body.lifePathNumber) : null
  const city           = sanitizeString(body.city, 100)
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const email          = sanitizeString(body.email, 254)
  const region         = isValidRegion(body.region) ? body.region : 'western'

  assertInput(isValidReportId(sessionId), 'Invalid session ID')
  assertInput(!!firstName, 'firstName is required')
  assertInput(
    body.report !== null && typeof body.report === 'object',
    'Invalid report payload',
  )

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  const { error } = await supabase
    .from('reports')
    .insert({
      session_id: sessionId,
      first_name: firstName,
      archetype,
      life_path_number: lifePathNumber,
      report_data: body.report,
      answers: body.answers ?? {},
      city,
      date_of_birth: dateOfBirth,
      email: isValidEmail(email) ? email : '',
      region,
      email_sent: false,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Supabase insert error:', error.code)
    throw createError({ statusCode: 500, message: 'Failed to save report' })
  }

  return { success: true }
})
