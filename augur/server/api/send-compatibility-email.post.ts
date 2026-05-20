import { Resend } from 'resend'
import { CompatibilitySchema, BirthChartSchema, type BirthChartType } from '~~/server/utils/ai-schemas'
import { he } from '~~/server/utils/report-email-builder'
import { EMAIL_BRAND_LINE, EMAIL_ADDRESS_LINE, EMAIL_FOOTER_TEXT_MAILTO } from '~~/server/utils/email-footer'

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

  const scoreColor = score >= 80
    ? '#8c6eff'
    : score >= 60
      ? '#c89632'
      : '#b45050'

  const renderBirthChartBlock = (name: string, chart: BirthChartType, noonFallback: boolean): string => `
    <div style="margin: 32px 0; padding: 24px;
      background: rgba(80,120,255,0.05);
      border: 1px solid rgba(100,140,255,0.15);
      border-radius: 12px;">
      <p style="font-size: 10px; font-weight: 500;
        color: rgba(140,170,255,0.7);
        text-transform: uppercase;
        letter-spacing: 0.1em; margin: 0 0 4px;">
        &#10022; ${he(name)}'s Birth Chart
      </p>
      <p style="font-size: 16px; font-weight: 500;
        color: white; margin: 0 0 16px;">${he(chart.chartTitle)}</p>
      <div style="display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="padding: 8px 14px; background: rgba(100,140,255,0.08);
          border: 1px solid rgba(100,140,255,0.2); border-radius: 8px; text-align: center;">
          <p style="font-size: 9px; color: rgba(160,190,255,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Rising</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(180,210,255,0.9); margin: 0;">${he(chart.risingSign)}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(100,140,255,0.08);
          border: 1px solid rgba(100,140,255,0.2); border-radius: 8px; text-align: center;">
          <p style="font-size: 9px; color: rgba(160,190,255,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Sun</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(180,210,255,0.9); margin: 0;">${he(chart.sunSign)}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(100,140,255,0.08);
          border: 1px solid rgba(100,140,255,0.2); border-radius: 8px; text-align: center;">
          <p style="font-size: 9px; color: rgba(160,190,255,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Moon</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(180,210,255,0.9); margin: 0;">${he(chart.moonSign)}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(100,140,255,0.08);
          border: 1px solid rgba(100,140,255,0.2); border-radius: 8px; text-align: center;">
          <p style="font-size: 9px; color: rgba(160,190,255,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Dominant</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(180,210,255,0.9); margin: 0;">${he(chart.dominantPlanet)}</p>
        </div>
      </div>
      ${chart.powerHouse ? `
      <p style="font-size: 11px; color: rgba(160,190,255,0.5);
        text-transform: uppercase; letter-spacing: 0.08em;
        margin: 0 0 6px;">Power House</p>
      <p style="font-size: 13px; font-weight: 500;
        color: rgba(180,210,255,0.8); margin: 0 0 16px;">
        ${he(chart.powerHouse)}
      </p>` : ''}
      <p style="font-size: 14px; color: rgba(255,255,255,0.6);
        line-height: 1.8; margin: 0 0 16px;">${he(chart.reading)}</p>
      ${chart.forecast2026 ? `
      <div style="padding: 12px 16px; background: rgba(100,140,255,0.06);
        border-left: 2px solid rgba(140,170,255,0.4);
        border-radius: 0 8px 8px 0;">
        <p style="font-size: 9px; color: rgba(160,190,255,0.5);
          text-transform: uppercase; margin: 0 0 4px;">2026 Planetary Forecast</p>
        <p style="font-size: 13px; color: rgba(180,210,255,0.8);
          font-style: italic; margin: 0;">${he(chart.forecast2026)}</p>
      </div>` : ''}
      ${noonFallback ? `
      <p style="font-size: 11px; color: rgba(160,190,255,0.35);
        font-style: italic; margin: 16px 0 0;">
        Houses calculated using 12:00 PM as birth time — for precise placements, please contact support.
      </p>` : ''}
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
        <div style="margin-bottom: 32px; padding: 24px;
          background: rgba(140,110,255,0.08);
          border: 1px solid rgba(140,110,255,0.2);
          border-radius: 12px; text-align: center;">
          <p style="font-size: 11px; font-weight: 500;
            color: #8c6eff; text-transform: uppercase;
            letter-spacing: 0.1em; margin: 0 0 12px;">
            ${he(section.title)}
          </p>
          <p style="font-size: 17px; color: #c8b4ff;
            font-style: italic; line-height: 1.7; margin: 0;">
            &ldquo;${he(section.content)}&rdquo;
          </p>
        </div>
      `
    }

    return `
      <div style="margin-bottom: 32px;
        padding-bottom: 32px;
        border-bottom: 1px solid rgba(255,255,255,0.06);">
        <p style="font-size: 11px; font-weight: 500;
          color: #8c6eff; text-transform: uppercase;
          letter-spacing: 0.1em; margin: 0 0 10px;">
          ${he(section.title)}
        </p>
        <p style="font-size: 15px; color: #c0bfbf;
          line-height: 1.8; margin: 0;">
          ${he(section.content)}
        </p>
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
<body style="margin: 0; padding: 0;
  background-color: #0a0a0f;
  font-family: system-ui, -apple-system, sans-serif;">

  <div style="max-width: 600px; margin: 0 auto;
    padding: 40px 24px;">

    <!-- HEADER -->
    <div style="text-align: center; margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 1px solid rgba(255,255,255,0.06);">

      <p style="font-size: 13px; font-weight: 500;
        color: rgba(255,255,255,0.25);
        letter-spacing: 0.15em; margin: 0 0 24px;">
        OMENORA
      </p>

      <p style="font-size: 11px; color: #8c6eff;
        text-transform: uppercase; letter-spacing: 0.1em;
        margin: 0 0 16px;">
        Compatibility Reading
      </p>

      <p style="font-size: 72px; font-weight: 500;
        color: ${scoreColor}; margin: 0 0 8px;
        line-height: 1;">
        ${he(String(score))}%
      </p>

      <h1 style="font-size: 20px; font-weight: 500;
        color: rgba(230,220,255,0.85);
        margin: 0 0 8px; line-height: 1.4;
        font-style: italic;">
        ${he(compatTitle)}
      </h1>

      <p style="font-size: 14px;
        color: rgba(255,255,255,0.3); margin: 16px 0 0;">
        ${he(firstName)} &amp; ${he(partnerName)}
      </p>
    </div>

    <!-- SECTIONS -->
    ${sectionsHtml}

    <!-- BIRTH CHARTS (T2 tier only) -->
    ${birthChartsHtml}

    <!-- FOOTER -->
    <div style="text-align: center; margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.04);">

      <p style="font-size: 12px;
        color: rgba(255,255,255,0.15);
        margin: 0 0 8px;">
        omenora.com &mdash; Destiny Compatibility Reading
      </p>

      <p style="font-size: 11px;
        color: rgba(255,255,255,0.1); margin: 0 0 8px;">
        This reading was generated for ${he(email)}
      </p>

      <p style="font-size: 10px; color: rgba(255,255,255,0.07); margin: 0 0 4px;">
        ${EMAIL_BRAND_LINE}
      </p>
      <p style="font-size: 10px; color: rgba(255,255,255,0.07); margin: 0 0 6px;">
        ${EMAIL_ADDRESS_LINE}
      </p>
      <p style="font-size: 10px; color: rgba(255,255,255,0.10); margin: 0;">
        ${tier === 'subscription'
          ? `<a href="https://omenora.com/account" style="color: rgba(200,180,255,0.4); text-decoration: underline; margin-right: 12px;">Manage your subscription</a><br><span style="font-size: 10px; color: rgba(255,255,255,0.12);">To cancel: click &ldquo;Manage your subscription&rdquo; above &rarr; Cancel plan. Takes 10 seconds.</span>`
          : ''}
        <a href="mailto:unsubscribe@omenora.com?subject=unsubscribe" style="color: rgba(255,255,255,0.15); text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>

  </div>
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
