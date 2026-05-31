import { Resend } from 'resend'
import { CompatibilitySchema, BirthChartSchema, type BirthChartType } from '~~/server/utils/ai-schemas'
import { he } from '~~/server/utils/report-email-builder'
import { EMAIL_BRAND_LINE, EMAIL_ADDRESS_LINE, EMAIL_FOOTER_TEXT_MAILTO } from '~~/server/utils/email-footer'
import {
  E_BG_PAGE, E_BG_PRIMARY, E_BORDER_SUBTLE, E_BORDER_FAINT,
  E_TEXT_PRIMARY, E_TEXT_SECONDARY, E_TEXT_TERTIARY,
  E_ACCENT,
  E_FONT_DISPLAY, E_FONT_UI,
  E_TEXT_XS, E_TEXT_SM, E_TEXT_BASE, E_TEXT_MD, E_TEXT_LG,
  E_TRACKING_CAPS, E_TRACKING_WIDE,
  E_SPACE_1, E_SPACE_2, E_SPACE_3, E_SPACE_4, E_SPACE_6, E_SPACE_8, E_SPACE_10,
  E_RADIUS_SM, E_RADIUS_LG,
  emailScoreColor,
} from '~~/server/utils/email-design-tokens'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const email       = sanitizeString(body.email ?? '', 254)
  const firstName   = sanitizeString(body.firstName ?? '', 50)
  const partnerName = sanitizeString(body.partnerName ?? '', 50)
  const language    = sanitizeString(body.language || 'en', 5)
  const tier        = sanitizeString(body.tier ?? '', 20)

  const userBirthChartNoonFallback    = body.userBirthChartNoonFallback    === true
  const partnerBirthChartNoonFallback = body.partnerBirthChartNoonFallback === true

  let parsedUserBirthChart:    BirthChartType | null = null
  let parsedPartnerBirthChart: BirthChartType | null = null

  if (body.userBirthChart !== null && body.userBirthChart !== undefined) {
    const r = BirthChartSchema.safeParse(body.userBirthChart)
    if (r.success) { parsedUserBirthChart = r.data }
    else { console.warn('[send-compatibility-email] userBirthChart validation failed:', r.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')) }
  }
  if (body.partnerBirthChart !== null && body.partnerBirthChart !== undefined) {
    const r = BirthChartSchema.safeParse(body.partnerBirthChart)
    if (r.success) { parsedPartnerBirthChart = r.data }
    else { console.warn('[send-compatibility-email] partnerBirthChart validation failed:', r.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')) }
  }

  const hasBothCharts = parsedUserBirthChart !== null && parsedPartnerBirthChart !== null

  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(
    body.compatibility !== null && typeof body.compatibility === 'object',
    'compatibility object is required',
  )

  const compatParse = CompatibilitySchema.safeParse(body.compatibility)
  if (!compatParse.success) {
    console.warn('[send-compatibility-email] Schema validation failed:', compatParse.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '))
    throw createError({ statusCode: 422, message: 'Invalid compatibility payload' })
  }
  const compatibility = compatParse.data

  const resend = new Resend(config.resendApiKey as string)

  const sections    = compatibility.sections
  const score       = compatibility.compatibilityScore
  const compatTitle = compatibility.compatibilityTitle

  type SectionKey = keyof typeof sections
  const sectionOrder: SectionKey[] = ['bond', 'strength', 'challenge', 'communication', 'powerDynamic', 'forecast', 'advice']

  const scoreColor = emailScoreColor(score)

  const renderBirthChartBlock = (name: string, chart: BirthChartType, noonFallback: boolean): string => `
    <div style="margin:${E_SPACE_8} 0;padding:${E_SPACE_6};background:${E_BG_PRIMARY};border:1px solid ${E_BORDER_SUBTLE};border-radius:${E_RADIUS_LG};">
      <p style="font-size:${E_TEXT_XS};font-weight:500;font-family:${E_FONT_UI};color:rgba(140,170,255,0.85);text-transform:uppercase;letter-spacing:${E_TRACKING_CAPS};margin:0 0 ${E_SPACE_1};">${he(name)}'s Birth Chart</p>
      <p style="font-size:${E_TEXT_MD};font-weight:500;font-family:${E_FONT_DISPLAY};color:${E_TEXT_PRIMARY};margin:0 0 ${E_SPACE_4};">${he(chart.chartTitle)}</p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:${E_SPACE_4};">
        <tr>
          <td style="padding:${E_SPACE_2} ${E_SPACE_3};background:${E_BG_PRIMARY};border:1px solid ${E_BORDER_SUBTLE};border-radius:${E_RADIUS_SM};text-align:center;padding-right:${E_SPACE_4};">
            <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};text-transform:uppercase;margin:0 0 2px;">Rising</p>
            <p style="font-size:${E_TEXT_SM};font-weight:500;font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};margin:0;">${he(chart.risingSign)}</p>
          </td>
          <td style="padding:${E_SPACE_2} ${E_SPACE_3};background:${E_BG_PRIMARY};border:1px solid ${E_BORDER_SUBTLE};border-radius:${E_RADIUS_SM};text-align:center;padding-right:${E_SPACE_4};">
            <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};text-transform:uppercase;margin:0 0 2px;">Sun</p>
            <p style="font-size:${E_TEXT_SM};font-weight:500;font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};margin:0;">${he(chart.sunSign)}</p>
          </td>
          <td style="padding:${E_SPACE_2} ${E_SPACE_3};background:${E_BG_PRIMARY};border:1px solid ${E_BORDER_SUBTLE};border-radius:${E_RADIUS_SM};text-align:center;padding-right:${E_SPACE_4};">
            <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};text-transform:uppercase;margin:0 0 2px;">Moon</p>
            <p style="font-size:${E_TEXT_SM};font-weight:500;font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};margin:0;">${he(chart.moonSign)}</p>
          </td>
          <td style="padding:${E_SPACE_2} ${E_SPACE_3};background:${E_BG_PRIMARY};border:1px solid ${E_BORDER_SUBTLE};border-radius:${E_RADIUS_SM};text-align:center;">
            <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};text-transform:uppercase;margin:0 0 2px;">Dominant</p>
            <p style="font-size:${E_TEXT_SM};font-weight:500;font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};margin:0;">${he(chart.dominantPlanet)}</p>
          </td>
        </tr>
      </table>
      ${chart.powerHouse ? `
      <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};text-transform:uppercase;letter-spacing:${E_TRACKING_CAPS};margin:0 0 ${E_SPACE_2};">Power House</p>
      <p style="font-size:${E_TEXT_SM};font-weight:500;font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};margin:0 0 ${E_SPACE_4};">${he(chart.powerHouse)}</p>` : ''}
      <p style="font-size:${E_TEXT_BASE};font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};line-height:1.8;margin:0 0 ${E_SPACE_4};">${he(chart.reading)}</p>
      ${chart.forecast2026 ? `
      <div style="padding:${E_SPACE_3} ${E_SPACE_4};background:${E_BG_PAGE};border-left:2px solid ${E_ACCENT};border-radius:0 ${E_RADIUS_SM} ${E_RADIUS_SM} 0;">
        <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};text-transform:uppercase;letter-spacing:${E_TRACKING_CAPS};margin:0 0 ${E_SPACE_1};">2026 Planetary Forecast</p>
        <p style="font-size:${E_TEXT_SM};font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};font-style:italic;margin:0;">${he(chart.forecast2026)}</p>
      </div>` : ''}
      ${noonFallback ? `
      <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_DISPLAY};color:${E_TEXT_TERTIARY};font-style:italic;margin:${E_SPACE_4} 0 0;">Houses calculated using 12:00 PM as birth time — for precise placements, please contact support.</p>` : ''}
    </div>
  `

  const birthChartsHtml = hasBothCharts
    ? renderBirthChartBlock(firstName, parsedUserBirthChart!, userBirthChartNoonFallback)
      + renderBirthChartBlock(partnerName, parsedPartnerBirthChart!, partnerBirthChartNoonFallback)
    : ''

  const sectionsHtml = sectionOrder.map((key) => {
    const section = sections[key]
    if (!section) return ''

    const isAdvice = key === 'advice'

    if (isAdvice) {
      return `
        <div style="margin-bottom:${E_SPACE_8};padding:${E_SPACE_6};background:${E_BG_PRIMARY};border:1px solid ${E_BORDER_SUBTLE};border-radius:${E_RADIUS_LG};text-align:center;">
          <p style="font-size:${E_TEXT_XS};font-weight:500;font-family:${E_FONT_UI};color:${E_ACCENT};text-transform:uppercase;letter-spacing:${E_TRACKING_CAPS};margin:0 0 ${E_SPACE_3};">${he(section.title)}</p>
          <p style="font-size:${E_TEXT_MD};font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};font-style:italic;line-height:1.7;margin:0;">&ldquo;${he(section.content)}&rdquo;</p>
        </div>
      `
    }

    return `
      <div style="margin-bottom:${E_SPACE_8};padding-bottom:${E_SPACE_8};border-bottom:1px solid ${E_BORDER_FAINT};">
        <p style="font-size:${E_TEXT_XS};font-weight:500;font-family:${E_FONT_UI};color:${E_ACCENT};text-transform:uppercase;letter-spacing:${E_TRACKING_CAPS};margin:0 0 ${E_SPACE_3};">${he(section.title)}</p>
        <p style="font-size:${E_TEXT_BASE};font-family:${E_FONT_DISPLAY};color:${E_TEXT_SECONDARY};line-height:1.8;margin:0;">${he(section.content)}</p>
      </div>
    `
  }).join('')

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your OMENORA Compatibility Reading</title>
</head>
<body style="margin:0;padding:0;background-color:${E_BG_PAGE};font-family:${E_FONT_DISPLAY};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${E_BG_PAGE};">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;padding:${E_SPACE_10} ${E_SPACE_6};">

        <!-- HEADER -->
        <tr><td style="text-align:center;padding-bottom:${E_SPACE_10};border-bottom:1px solid ${E_BORDER_FAINT};">
          <p style="font-size:${E_TEXT_XS};font-weight:500;font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};letter-spacing:${E_TRACKING_WIDE};margin:0 0 ${E_SPACE_6};text-transform:uppercase;">OMENORA</p>
          <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_ACCENT};text-transform:uppercase;letter-spacing:${E_TRACKING_CAPS};margin:0 0 ${E_SPACE_4};">Compatibility Reading</p>
          <p style="font-size:56px;font-weight:500;font-family:${E_FONT_DISPLAY};color:${scoreColor};margin:0 0 ${E_SPACE_2};line-height:1;">${he(String(score))}%</p>
          <h1 style="font-size:${E_TEXT_LG};font-weight:400;font-family:${E_FONT_DISPLAY};color:${E_TEXT_PRIMARY};margin:0 0 ${E_SPACE_2};line-height:1.4;font-style:italic;">${he(compatTitle)}</h1>
          <p style="font-size:${E_TEXT_SM};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};margin:${E_SPACE_4} 0 0;">${he(firstName)} &amp; ${he(partnerName)}</p>
        </td></tr>

        <!-- SECTIONS -->
        <tr><td style="padding-top:${E_SPACE_8};">${sectionsHtml}</td></tr>

        <!-- BIRTH CHARTS (T2 tier only) -->
        ${birthChartsHtml ? `<tr><td>${birthChartsHtml}</td></tr>` : ''}

        <!-- FOOTER -->
        <tr><td style="text-align:center;padding-top:${E_SPACE_8};border-top:1px solid ${E_BORDER_FAINT};">
          <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};margin:0 0 ${E_SPACE_2};">omenora.com &mdash; Destiny Compatibility Reading</p>
          <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};margin:0 0 ${E_SPACE_2};">This reading was generated for ${he(email)}</p>
          <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};margin:0 0 ${E_SPACE_1};">${EMAIL_BRAND_LINE}</p>
          <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};margin:0 0 ${E_SPACE_2};">${EMAIL_ADDRESS_LINE}</p>
          <p style="font-size:${E_TEXT_XS};font-family:${E_FONT_UI};color:${E_TEXT_TERTIARY};margin:0;">
            ${tier === 'subscription'
              ? `<a href="https://omenora.com/account" style="color:${E_ACCENT};text-decoration:underline;margin-right:12px;">Manage your subscription</a><br><span style="font-size:${E_TEXT_XS};color:${E_TEXT_TERTIARY};">To cancel: click &ldquo;Manage your subscription&rdquo; above &rarr; Cancel plan.</span>`
              : ''}
            <a href="mailto:unsubscribe@omenora.com?subject=unsubscribe" style="color:${E_TEXT_TERTIARY};text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `

  const compatSubjects: Record<string, string> = {
    en: `${firstName} & ${partnerName} — Your compatibility analysis`,
    es: `${firstName} & ${partnerName} — Tu análisis de compatibilidad`,
    pt: `${firstName} & ${partnerName} — Sua análise de compatibilidade`,
    hi: `${firstName} & ${partnerName} — आपका अनुकूलता विश्लेषण`,
    ko: `${firstName} & ${partnerName} — 궁합 분석 결과`,
    zh: `${firstName} & ${partnerName} — 您的合盘分析`,
  }
  const withChartsSubjects: Record<string, string> = {
    en: `${firstName} & ${partnerName} — Compatibility Reading + Birth Charts`,
    es: `${firstName} & ${partnerName} — Lectura de compatibilidad + cartas natales`,
    pt: `${firstName} & ${partnerName} — Leitura de compatibilidade + mapas natais`,
    hi: `${firstName} & ${partnerName} — अनुकूलता विश्लेषण + जन्म कुंडली`,
    ko: `${firstName} & ${partnerName} — 궁합 분석 + 출생 차트`,
    zh: `${firstName} & ${partnerName} — 合盘分析 + 星盘`,
  }
  const compatSubject = hasBothCharts
    ? (withChartsSubjects[language as string] ?? withChartsSubjects['en'] ?? `${firstName} & ${partnerName} — Compatibility Reading + Birth Charts`)
    : (compatSubjects[language as string] ?? compatSubjects['en'] ?? `${firstName} & ${partnerName} — Your compatibility analysis`)

  const compatPlainText = [
    `OMENORA — Compatibility Analysis`,
    ``,
    `${firstName} & ${partnerName}`,
    `Compatibility score: ${score}%`,
    compatTitle ? compatTitle : '',
    ``,
    ...sectionOrder.map((key) => {
      const s = sections[key]
      return s ? `${s.title}\n${s.content}` : ''
    }).filter(Boolean),
    ...(hasBothCharts && parsedUserBirthChart ? [
      `---`,
      `${firstName}'s Birth Chart`,
      `${parsedUserBirthChart.chartTitle}`,
      `Rising: ${parsedUserBirthChart.risingSign} | Sun: ${parsedUserBirthChart.sunSign} | Moon: ${parsedUserBirthChart.moonSign} | Dominant: ${parsedUserBirthChart.dominantPlanet}`,
      `Power House: ${parsedUserBirthChart.powerHouse}`,
      parsedUserBirthChart.reading,
      `2026 Forecast: ${parsedUserBirthChart.forecast2026}`,
      ...(userBirthChartNoonFallback ? [`Note: Houses calculated using 12:00 PM as birth time.`] : []),
    ] : []),
    ...(hasBothCharts && parsedPartnerBirthChart ? [
      `---`,
      `${partnerName}'s Birth Chart`,
      `${parsedPartnerBirthChart.chartTitle}`,
      `Rising: ${parsedPartnerBirthChart.risingSign} | Sun: ${parsedPartnerBirthChart.sunSign} | Moon: ${parsedPartnerBirthChart.moonSign} | Dominant: ${parsedPartnerBirthChart.dominantPlanet}`,
      `Power House: ${parsedPartnerBirthChart.powerHouse}`,
      parsedPartnerBirthChart.reading,
      `2026 Forecast: ${parsedPartnerBirthChart.forecast2026}`,
      ...(partnerBirthChartNoonFallback ? [`Note: Houses calculated using 12:00 PM as birth time.`] : []),
    ] : []),
    ``,
    ...(tier === 'subscription' ? [`---`, `Manage your subscription: https://omenora.com/account`, `To cancel: visit the link above → Cancel plan. Takes 10 seconds.`] : []),
    EMAIL_FOOTER_TEXT_MAILTO,
  ].filter(s => s !== '').join('\n\n')

  const { error } = await resend.emails.send({
    from: 'OMENORA <reading@omenora.com>',
    replyTo: 'support@omenora.com',
    to: [email],
    subject: compatSubject,
    html: htmlContent,
    text: compatPlainText,
  })

  if (error) {
    console.error('[send-compatibility-email] Resend error:', error?.message, error?.name)
    throw createError({
      statusCode: 500,
      message: 'Failed to send compatibility email'
    })
  }

  return { success: true }
})
