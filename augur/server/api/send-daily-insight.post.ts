import { Resend } from 'resend'
import { he } from '~~/server/utils/report-email-builder'
import { unsubscribeToken } from '~~/server/api/unsubscribe.get'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only internal worker (process-jobs) may call this ─────────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''
  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const email     = sanitizeString(body.email ?? '', 254)
  const _firstName = sanitizeString(body.firstName ?? '', 50)
  const archetype = sanitizeString(body.archetype ?? '', 30)
  const rawInsight = body.insight && typeof body.insight === 'object' ? body.insight : null

  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(rawInsight !== null, 'insight object is required')

  const unsubToken = unsubscribeToken(email, expectedSecret)
  const unsubUrl   = `https://omenora.com/api/unsubscribe?token=${unsubToken}&e=${encodeURIComponent(email)}`

  // Validate that all required fields are non-empty strings before interpolation.
  const insight = {
    moonPhase:           sanitizeString(rawInsight.moonPhase, 100),
    dayTheme:            sanitizeString(rawInsight.dayTheme, 100),
    greeting:            sanitizeString(rawInsight.greeting, 300),
    insight:             sanitizeString(rawInsight.insight, 2000),
    reflection_question: sanitizeString(rawInsight.reflection_question ?? rawInsight.action ?? '', 500),
    subject:             sanitizeString(rawInsight.subject ?? '', 200),
  }

  assertInput(!!insight.greeting, 'insight.greeting is required')
  assertInput(!!insight.insight, 'insight.insight is required')

  const resend = new Resend(config.resendApiKey)

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Your Daily OMENORA Insight</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f2ee; font-family: Georgia, 'Times New Roman', serif;" bgcolor="#f5f2ee">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f2ee;" bgcolor="#f5f2ee">
    <tr>
      <td align="center" style="padding: 40px 16px 48px;">
        <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; width: 100%; background-color: #faf8f5; border-radius: 4px;" bgcolor="#faf8f5">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #ede9e2;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 11px; font-weight: 500; color: #9e9285; letter-spacing: 0.18em; font-family: Georgia, serif; text-transform: uppercase;">OMENORA</td>
                  <td align="right" style="font-size: 11px; color: #a097c8; font-family: Georgia, serif;">${he(insight.moonPhase)} &middot; ${he(insight.dayTheme)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <p style="font-size: 24px; font-weight: 500; color: #1a1410; margin: 0 0 20px; line-height: 1.3; font-family: Georgia, serif;">${he(insight.greeting)}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 40px 28px;">
              <p style="font-size: 15px; color: #3d3530; line-height: 1.85; margin: 0; font-family: Georgia, serif;">${he(insight.insight)}</p>
            </td>
          </tr>

          <!-- Reflection question -->
          <tr>
            <td style="padding: 0 40px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0ece5; border-radius: 4px;" bgcolor="#f0ece5">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="font-size: 9px; color: #a097c8; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 10px; font-family: Georgia, serif;">A question worth sitting with</p>
                    <p style="font-size: 15px; font-style: italic; color: #3d3530; margin: 0; line-height: 1.65; font-family: Georgia, serif;">${he(insight.reflection_question)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #ede9e2;">
              <p style="font-size: 11px; color: #b0a89a; line-height: 1.7; margin: 0 0 12px; font-family: sans-serif;">
                OMENORA Daily Insights are for self-reflection and personal exploration only. They are not a substitute for professional advice, therapy, or medical care. If you are experiencing a mental health crisis, support is available 24/7 at 988 (call or text).
              </p>
              <p style="font-size: 11px; color: #c0b8ac; margin: 0; font-family: sans-serif;">
                <a href="${unsubUrl}" style="color: #9e9285; text-decoration: underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp; omenora.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'OMENORA <reading@omenora.com>',
    replyTo: 'support@omenora.com',
    to: [email],
    subject: insight.subject || `Your daily insight from OMENORA — ${insight.dayTheme || 'today'}`,
    // subject is plain text — no escaping needed for email subject lines
    html: htmlContent,
    text: [
      `OMENORA — Daily Insight`,
      ``,
      insight.greeting || '',
      ``,
      insight.insight || '',
      ``,
      `A question worth sitting with:`,
      insight.reflection_question || '',
      ``,
      `---`,
      `OMENORA Daily Insights are for self-reflection and personal exploration only. They are not a substitute for professional advice, therapy, or medical care. If you are experiencing a mental health crisis, support is available 24/7 at 988 (call or text).`,
      ``,
      `OMENORA · omenora.com`,
      `To unsubscribe: ${unsubUrl}`,
    ].join('\n'),
  })

  if (error) {
    console.error('[send-daily-insight] Resend error:', error?.message, error?.name)
    throw createError({ statusCode: 500, message: 'Failed to send daily insight' })
  }

  return { success: true }
})
