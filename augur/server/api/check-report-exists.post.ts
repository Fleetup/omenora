import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const sessionId = sanitizeString(body.sessionId, 200)

  if (!isValidReportId(sessionId)) {
    return { exists: false, emailSent: false }
  }

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string
  )

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id, email_sent, report_data, first_name, archetype, life_path_number, region, date_of_birth, time_of_birth')
      .eq('session_id', sessionId)
      .single()

    if (error || !data) {
      return { exists: false, emailSent: false }
    }

    return {
      exists: true,
      emailSent: data.email_sent || false,
      report: data,
    }
  } catch {
    return { exists: false, emailSent: false }
  }
})
