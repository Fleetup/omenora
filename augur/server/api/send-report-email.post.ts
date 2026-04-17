import { sendReportEmail } from '~~/server/utils/report-email-builder'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const {
    email,
    firstName,
    report,
    archetype,
    lifePathNumber,
    element,
    region,
    vedicData,
    baziData,
    tarotData,
    calendarData,
    birthChartData,
    bundlePurchased: _bundlePurchased,
    language,
  } = body

  if (!email || !report) {
    throw createError({
      statusCode: 400,
      message: 'Email and report are required'
    })
  }

  // Supabase can return JSONB columns as a raw string in some configurations.
  // Defensively parse if the caller passed a stringified object.
  let parsedReport = report
  if (typeof parsedReport === 'string') {
    try {
      parsedReport = JSON.parse(parsedReport)
    } catch {
      throw createError({
        statusCode: 400,
        message: 'Invalid report payload: could not parse report JSON'
      })
    }
  }

  if (typeof parsedReport !== 'object' || typeof parsedReport.sections !== 'object' || parsedReport.sections === null) {
    throw createError({
      statusCode: 400,
      message: 'Invalid report payload: sections missing'
    })
  }

  const resendKey = config.resendApiKey as string | undefined
  if (!resendKey) {
    throw createError({
      statusCode: 503,
      message: 'Email service is not configured'
    })
  }

  try {
    const emailId = await sendReportEmail(resendKey, {
      email,
      firstName,
      report: parsedReport,
      archetype,
      lifePathNumber,
      element,
      region,
      vedicData,
      baziData,
      tarotData,
      calendarData,
      birthChartData,
      language,
    })
    return { success: true, emailId }
  } catch (err: any) {
    console.error('[send-report-email] Failed:', err?.message)
    throw createError({ statusCode: 500, message: 'Failed to send email' })
  }
})
