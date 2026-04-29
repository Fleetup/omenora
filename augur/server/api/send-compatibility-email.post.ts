import { Resend } from 'resend'
import { CompatibilitySchema } from '~~/server/utils/ai-schemas'
import { he } from '~~/server/utils/report-email-builder'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const email       = sanitizeString(body.email ?? '', 254)
  const firstName   = sanitizeString(body.firstName ?? '', 50)
  const partnerName = sanitizeString(body.partnerName ?? '', 50)
  const language    = sanitizeString(body.language || 'en', 5)
  const tier        = sanitizeString(body.tier ?? '', 20)

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

      <p style="font-size: 10px; color: rgba(255,255,255,0.07); margin: 0;">
        OMENORA &middot; 1309 Coffeen Ave STE 1200, Sheridan, WY 82801
      </p>
      <p style="font-size: 10px; color: rgba(255,255,255,0.10); margin: 6px 0 0;">
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
  const compatSubject = compatSubjects[language as string] ?? compatSubjects['en'] ?? `${firstName} & ${partnerName} — Your compatibility analysis`

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
    ``,
    `---`,
    `OMENORA · omenora.com`,
    ...(tier === 'subscription' ? [`Manage your subscription: https://omenora.com/account`, `To cancel: visit the link above → Cancel plan. Takes 10 seconds.`] : []),
    `To unsubscribe, email unsubscribe@omenora.com`,
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
