import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId    = sanitizeString(body.sessionId, 200)
  const firstName    = sanitizeString(body.firstName, 50)
  const calendarData = body.calendarData && typeof body.calendarData === 'object' ? body.calendarData : null

  assertInput(isValidReportId(sessionId), 'Invalid session ID')
  assertInput(!!firstName, 'firstName is required')
  assertInput(calendarData !== null, 'calendarData is required')

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  const { error } = await supabase
    .from('calendars')
    .upsert({
      session_id:    sessionId,
      first_name:    firstName,
      calendar_data: calendarData,
      created_at:    new Date().toISOString(),
    })

  if (error) {
    console.error('[save-calendar] Upsert error:', error.code)
  }

  return { success: true }
})
