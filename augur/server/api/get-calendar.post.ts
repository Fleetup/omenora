import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { sessionId } = body

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  )

  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 404,
      message: 'Calendar not found',
    })
  }

  return { calendar: data }
})
