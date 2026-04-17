import { sendReportEmail } from '~~/server/utils/report-email-builder'

/**
 * Returns a self-contained inline SVG string for each archetype symbol.
 * This is used in email HTML where web fonts and Vue components are unavailable.
 * All shapes are drawn as vector paths — identical across every email client.
 */
function archetypeSymbolSvg(symbol: string, size = 52): string {
  const c = 50
  const color = 'rgba(200,180,255,0.6)'
  const sw = 4

  const shapes: Record<string, string> = {
    // ● phoenix — filled circle
    '●': `<circle cx="${c}" cy="${c}" r="31" fill="${color}"/>`,
    // ◆ architect — filled diamond
    '◆': `<polygon points="${c},15 ${c+35},${c} ${c},85 ${c-35},${c}" fill="${color}"/>`,
    // ▲ storm — filled upward triangle
    '▲': `<polygon points="${c},14 ${c+46},${c+27} ${c-46},${c+27}" fill="${color}"/>`,
    // ◇ lighthouse — open diamond
    '◇': `<polygon points="${c},15 ${c+35},${c} ${c},85 ${c-35},${c}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    // ○ wanderer — open circle
    '○': `<circle cx="${c}" cy="${c}" r="31" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    // ⬡ alchemist — open hexagon
    '⬡': `<polygon points="${c+44},${c} ${c+22},${c+38} ${c-22},${c+38} ${c-44},${c} ${c-22},${c-38} ${c+22},${c-38}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    // □ guardian — open square
    '□': `<rect x="${c-31}" y="${c-31}" width="62" height="62" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    // ⬟ visionary — open wide diamond
    '⬟': `<polygon points="${c},${c-44} ${c+44},${c} ${c},${c+44} ${c-44},${c}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    // ◉ mirror — filled dot + outer ring
    '◉': `<circle cx="${c}" cy="${c}" r="14" fill="${color}"/><circle cx="${c}" cy="${c}" r="31" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    // ✦ catalyst — 4-pointed star
    '✦': `<polygon points="${c},${c-44} ${c+14},${c+14} ${c+44},${c} ${c+14},${c-14} ${c},${c+44} ${c-14},${c-14} ${c-44},${c} ${c-14},${c+14}" fill="${color}"/>`,
    // ▽ sage — open downward triangle
    '▽': `<polygon points="${c-46},${c-27} ${c+46},${c-27} ${c},${c+36}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    // ★ wildfire — 5-pointed star
    '★': `<polygon points="${c},${c-44} ${c+13},${c-13} ${c+44},${c-14} ${c+21},${c+10} ${c+27},${c+44} ${c},${c+26} ${c-27},${c+44} ${c-21},${c+10} ${c-44},${c-14} ${c-13},${c-13}" fill="${color}"/>`,
  }

  const path = shapes[symbol] ?? `<circle cx="${c}" cy="${c}" r="31" fill="${color}"/>`
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${path}</svg>`
}

/** Escape HTML special characters in user-controlled strings before interpolation into email HTML. */
function he(str: unknown): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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
