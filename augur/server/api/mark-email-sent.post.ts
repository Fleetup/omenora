import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const sessionId = sanitizeString(body.sessionId, 200)

  assertInput(isValidReportId(sessionId), 'Invalid session ID')

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string
  )

  await supabase
    .from('reports')
    .update({ email_sent: true })
    .eq('session_id', sessionId)

  return { success: true }
})
