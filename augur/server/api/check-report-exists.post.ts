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
      .select('id, email_sent, report_data, first_name, archetype, life_path_number, region, date_of_birth, time_of_birth, email')
      .eq('session_id', sessionId)
      .single()

    if (error || !data) {
      return { exists: false, emailSent: false }
    }

    return {
      exists:    true,
      emailSent: data.email_sent || false,
      report: {
        id:               data.id,
        first_name:       data.first_name,
        archetype:        data.archetype,
        life_path_number: data.life_path_number,
        report_data:      data.report_data,
        region:           data.region,
        date_of_birth:    data.date_of_birth,
        time_of_birth:    data.time_of_birth,
        email:            data.email,
      },
    }
  } catch {
    return { exists: false, emailSent: false }
  }
})
