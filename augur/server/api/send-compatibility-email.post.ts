import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { email, firstName, partnerName, compatibility, language } = body

  if (!email || !compatibility) {
    throw createError({
      statusCode: 400,
      message: 'Email and compatibility data required'
    })
  }

  const resend = new Resend(config.resendApiKey as string)

  const sections = compatibility.sections
  const score = compatibility.compatibilityScore
  const compatTitle = compatibility.compatibilityTitle

  const sectionOrder = [
    'bond', 'strength', 'challenge', 'forecast', 'advice'
  ]

  const scoreColor = score >= 80
    ? '#8c6eff'
    : score >= 60
      ? '#c89632'
      : '#b45050'

  const sectionsHtml = sectionOrder.map((key: string) => {
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
            ${section.title}
          </p>
          <p style="font-size: 17px; color: #c8b4ff;
            font-style: italic; line-height: 1.7; margin: 0;">
            "${section.content}"
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
          ${section.title}
        </p>
        <p style="font-size: 15px; color: #c0bfbf;
          line-height: 1.8; margin: 0;">
          ${section.content}
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
        ${score}%
      </p>

      <h1 style="font-size: 20px; font-weight: 500;
        color: rgba(230,220,255,0.85);
        margin: 0 0 8px; line-height: 1.4;
        font-style: italic;">
        ${compatTitle}
      </h1>

      <p style="font-size: 14px;
        color: rgba(255,255,255,0.3); margin: 16px 0 0;">
        ${firstName} &amp; ${partnerName}
      </p>
    </div>

    <!-- SECTIONS -->
    ${sectionsHtml}

    <!-- FOOTER -->
    <div style="text-align: center; margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.04);">

      <p style="font-size: 12px;
        color: rgba(255,255,255,0.15);
        margin: 0 0 8px;">
        omenora.com — AI Destiny Analysis
      </p>

      <p style="font-size: 11px;
        color: rgba(255,255,255,0.1); margin: 0;">
        This reading was generated for ${email}
      </p>
    </div>

  </div>
</body>
</html>
  `

  const { error } = await resend.emails.send({
    from: 'OMENORA <onboarding@resend.dev>',
    to: [process.env.RESEND_TEST_EMAIL || email],
    subject: (() => {
      const subjects: Record<string, string> = {
        en: `${firstName} & ${partnerName} — Your Compatibility Reading`,
        es: `${firstName} & ${partnerName} — Tu Lectura de Compatibilidad`,
        pt: `${firstName} & ${partnerName} — Sua Leitura de Compatibilidade`,
        hi: `${firstName} & ${partnerName} — आपकी अनुकूलता रीडिंग`,
        ko: `${firstName} & ${partnerName} — 당신의 궁합 리딩`,
        zh: `${firstName} & ${partnerName} — 您的合盘解读`,
      }
      return subjects[language as string] ?? subjects['en'] ?? `${firstName} & ${partnerName} — Your Compatibility Reading`
    })(),
    html: htmlContent,
  })

  if (error) {
    console.error('Resend compatibility error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to send compatibility email'
    })
  }

  return { success: true }
})
