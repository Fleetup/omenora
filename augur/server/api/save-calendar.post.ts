import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { sessionId, calendarData, firstName } = body

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  )

  const { error } = await supabase
    .from('calendars')
    .upsert({
      session_id: sessionId,
      first_name: firstName,
      calendar_data: calendarData,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Calendar save error:', error)
  }

  return { success: true }
})
