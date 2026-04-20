import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId = sanitizeString(body.sessionId, 200)
  assertInput(isValidReportId(sessionId), 'Invalid session ID')

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  const { data, error } = await supabase
    .from('reports')
    .select('session_id, first_name, archetype, life_path_number, report_data, city, region')
    .eq('session_id', sessionId)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, message: 'Report not found' })
  }

  return { report: data }
})
