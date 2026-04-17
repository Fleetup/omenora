import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { email, firstName, calendar, language } = body

  if (!email || !calendar) {
    throw createError({
      statusCode: 400,
      message: 'Email and calendar data required'
    })
  }

  const resend = new Resend(config.resendApiKey as string)

  const months = calendar.months || []
  const peakMonths = calendar.peakMonths || []
  const cautionMonths = calendar.cautionMonths || []

  const monthsHtml = months.map((month: any) => {
    const energy = month.energyLevel || 60
    const energyColor = energy >= 75 ? '#c9a84c' : energy >= 55 ? '#8c6eff' : '#8a4444'
    const barPct = Math.round(energy)
    const accentColor = month.color || energyColor

    return `
      <div style="margin-bottom: 10px; padding: 16px 18px 14px 20px;
        background: #0c0b18; border: 1px solid #1a1830;
        border-left: 2px solid ${accentColor};">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">
          <tr>
            <td style="font-size:18px; font-weight:600; color:#ede8ff; font-family:Georgia,serif;">
              ${month.month}
            </td>
            <td align="right" style="font-size:14px; color:${energyColor}; font-weight:500;">
              ${energy}
            </td>
          </tr>
          <tr>
            <td style="font-size:10px; color:#3d3a52; text-transform:uppercase; letter-spacing:0.1em; padding-top:2px;">
              ${month.theme || ''}
            </td>
          </tr>
        </table>

        <div style="height:1px; background:#131220; margin-bottom:10px;">
          <div style="height:1px; width:${barPct}%; background:${energyColor};"></div>
        </div>

        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
          <tr>
            <td style="font-size:11px; color:#4a4760; padding-right:6px; white-space:nowrap;">Love</td>
            <td style="font-size:12px; color:#6b6880; line-height:1.5;">${month.love || ''}</td>
          </tr>
          <tr>
            <td style="font-size:11px; color:#4a4760; padding-right:6px; white-space:nowrap;">Money</td>
            <td style="font-size:12px; color:#6b6880; line-height:1.5;">${month.money || ''}</td>
          </tr>
          <tr>
            <td style="font-size:11px; color:#4a4760; padding-right:6px; white-space:nowrap;">Career</td>
            <td style="font-size:12px; color:#6b6880; line-height:1.5;">${month.career || ''}</td>
          </tr>
        </table>

        ${month.warning ? `
          <div style="margin-bottom:8px; padding:7px 10px;
            background:#180d0d; border:1px solid #3a1a1a;
            font-size:11px; color:#7a3a3a;">
            ${month.warning}
          </div>
        ` : ''}

        <div style="font-size:10px; color:#3a3550; letter-spacing:0.04em;">
          Lucky days &nbsp;
          ${(month.luckyDays || []).map((d: string | number) =>
            `<span style="display:inline-block; margin-right:4px; padding:1px 7px;
              background:#1a1508; border:1px solid #3d3018;
              font-size:10px; color:#7a6530;">${d}</span>`
          ).join('')}
        </div>
      </div>
    `
  }).join('')

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your OMENORA 2026 Destiny Calendar</title>
</head>
<body style="margin:0; padding:0; background-color:#050410;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="max-width:600px; margin:0 auto; padding:40px 24px 60px;">

    <!-- HEADER -->
    <div style="text-align:center; margin-bottom:36px; padding-bottom:28px;
      border-bottom:1px solid #131220;">

      <p style="font-size:10px; letter-spacing:0.2em; color:#2e2c3a;
        margin:0 0 24px; text-transform:uppercase;">
        OMENORA
      </p>

      <h1 style="font-size:30px; font-weight:400; color:#ede8ff;
        margin:0 0 10px; line-height:1.2; font-family:Georgia,serif;">
        ${firstName}'s 2026 Destiny Calendar
      </h1>

      <p style="font-size:13px; font-style:italic; color:#3d3a52;
        margin:0 0 24px; line-height:1.65;">
        ${calendar.overallTheme || ''}
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:8px 12px; background:#0f0d1a;
            border:1px solid #241f10; text-align:center;">
            <span style="font-size:10px; color:#7a6530; text-transform:uppercase;
              letter-spacing:0.1em;">Peak Months &nbsp;</span>
            <span style="font-size:11px; color:#c9a84c;">
              ${peakMonths.join(' &nbsp;·&nbsp; ')}
            </span>
          </td>
          <td width="12"></td>
          <td style="padding:8px 12px; background:#0f0d16;
            border:1px solid #1e1520; text-align:center;">
            <span style="font-size:10px; color:#5a2a2a; text-transform:uppercase;
              letter-spacing:0.1em;">Caution &nbsp;</span>
            <span style="font-size:11px; color:#8a4444;">
              ${cautionMonths.join(' &nbsp;·&nbsp; ')}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- MONTHS -->
    ${monthsHtml}

    <!-- FOOTER -->
    <div style="text-align:center; margin-top:40px; padding-top:20px;
      border-top:1px solid #0e0d1c;">

      <p style="font-size:10px; letter-spacing:0.12em; color:#1e1c2a; margin:0 0 4px;">
        OMENORA &nbsp;·&nbsp; omenora.com
      </p>
      <p style="font-size:10px; color:#181620; margin:0 0 6px;">
        ${email}
      </p>
      <p style="font-size:10px; color:#181620; margin:0;">
        OMENORA · 1309 Coffeen Ave STE 1200, Sheridan, WY 82801 ·
        <a href="mailto:unsubscribe@omenora.com?subject=unsubscribe" style="color:#2a2840; text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>
  `

  const calendarSubjects: Record<string, string> = {
    en: `${firstName}, your 2026 timing calendar is ready`,
    es: `${firstName}, tu calendario de tiempos 2026 está listo`,
    pt: `${firstName}, seu calendário de timing 2026 está pronto`,
    hi: `${firstName}, आपका 2026 कालेंडर तैयार है`,
    ko: `${firstName}, 2026년 타이밍 캘린더가 준비되었습니다`,
    zh: `${firstName}，您的2026年时机日历已准备好`,
  }
  const calendarSubject = calendarSubjects[language as string] ?? calendarSubjects['en'] ?? `${firstName}, your 2026 timing calendar is ready`

  const calendarPlainText = [
    `OMENORA — Your 2026 Timing Calendar`,
    ``,
    `${firstName}, your 2026 destiny calendar is ready.`,
    calendar.overallTheme ? calendar.overallTheme : '',
    ``,
    months.map((m: any) => [
      `${m.month} — ${m.theme || ''}`,
      `Love: ${m.love || ''}`,
      `Money: ${m.money || ''}`,
      `Career: ${m.career || ''}`,
      m.warning ? `Note: ${m.warning}` : '',
    ].filter(Boolean).join('\n')).join('\n\n'),
    ``,
    `---`,
    `OMENORA · omenora.com`,
    `To unsubscribe, email unsubscribe@omenora.com`,
  ].filter(s => s !== '').join('\n')

  const { error } = await resend.emails.send({
    from: 'OMENORA <reading@omenora.com>',
    replyTo: 'support@omenora.com',
    to: [email],
    subject: calendarSubject,
    html: htmlContent,
    text: calendarPlainText,
  })

  if (error) {
    console.error('Calendar email error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to send calendar email'
    })
  }

  return { success: true }
})
