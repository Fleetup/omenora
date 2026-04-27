import { Resend } from 'resend'
import { he } from '~~/server/utils/report-email-builder'
import { unsubscribeToken } from '~~/server/api/unsubscribe.get'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only internal worker may call this ───────────────────────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''
  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const email              = sanitizeString(body.email ?? '', 254)
  const firstName          = sanitizeString(body.firstName ?? '', 50)
  const weekStart          = sanitizeString(body.weekStart ?? '', 10)
  const weekEnd            = sanitizeString(body.weekEnd ?? '', 10)
  const weekTheme          = sanitizeString(body.weekTheme ?? '', 100)
  const connection         = sanitizeString(body.connection ?? '', 1500)
  const communication      = sanitizeString(body.communication ?? '', 1500)
  const tension            = sanitizeString(body.tension ?? '', 1500)
  const advice             = sanitizeString(body.advice ?? '', 1000)
  const person2SunSign     = sanitizeString(body.person2SunSign ?? '', 30)
  const compatibilityTitle = sanitizeString(body.compatibilityTitle ?? '', 200)

  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(!!weekStart, 'weekStart is required')
  assertInput(!!weekEnd, 'weekEnd is required')
  assertInput(!!connection, 'connection is required')

  // ── Format the week range for display (e.g. "Apr 28 – May 4") ─────────────
  function fmtShort(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return iso
    }
  }
  const weekLabel = `${fmtShort(weekStart)} – ${fmtShort(weekEnd)}`

  const unsubToken = unsubscribeToken(email, expectedSecret)
  const unsubUrl   = `https://omenora.com/api/unsubscribe?token=${unsubToken}&e=${encodeURIComponent(email)}`

  const resend = new Resend(config.resendApiKey)

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Your Relationship Weather — OMENORA</title>
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
                  <td align="right" style="font-size: 11px; color: #a097c8; font-family: Georgia, serif;">Relationship Weather &middot; ${he(weekLabel)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <p style="font-size: 24px; font-weight: 500; color: #1a1410; margin: 0 0 8px; line-height: 1.3; font-family: Georgia, serif;">Good morning, ${he(firstName)}.</p>
              <p style="font-size: 13px; color: #9e9285; margin: 0 0 4px; font-family: Georgia, serif; font-style: italic;">${he(weekTheme)}</p>
            </td>
          </tr>

          <!-- Connection section -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <p style="font-size: 10px; font-weight: 600; color: #4090c8; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 8px; font-family: Georgia, serif;">&#127754; CONNECTION</p>
              <p style="font-size: 15px; color: #3d3530; line-height: 1.85; margin: 0; font-family: Georgia, serif;">${he(connection)}</p>
            </td>
          </tr>

          <!-- Communication section -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <p style="font-size: 10px; font-weight: 600; color: #7a64c8; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 8px; font-family: Georgia, serif;">&#128172; COMMUNICATION</p>
              <p style="font-size: 15px; color: #3d3530; line-height: 1.85; margin: 0; font-family: Georgia, serif;">${he(communication)}</p>
            </td>
          </tr>

          <!-- Tension section -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <p style="font-size: 10px; font-weight: 600; color: #b85040; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 8px; font-family: Georgia, serif;">&#9889; TENSION</p>
              <p style="font-size: 15px; color: #3d3530; line-height: 1.85; margin: 0; font-family: Georgia, serif;">${he(tension)}</p>
            </td>
          </tr>

          <!-- Advice section -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <p style="font-size: 10px; font-weight: 600; color: #3a9e78; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 8px; font-family: Georgia, serif;">&#10022; ADVICE</p>
              <p style="font-size: 15px; color: #3d3530; line-height: 1.85; margin: 0; font-family: Georgia, serif;">${he(advice)}</p>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding: 28px 40px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0ece5; border-radius: 4px;" bgcolor="#f0ece5">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="font-size: 11px; color: #a097c8; margin: 0; font-family: Georgia, serif; font-style: italic;">
                      Based on your ${he(compatibilityTitle || 'compatibility')} reading${person2SunSign ? ` &middot; ${he(person2SunSign)} partner` : ''} &middot; Compatibility Plus
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 32px; border-top: 1px solid #ede9e2;">
              <p style="font-size: 11px; color: #b0a89a; line-height: 1.7; margin: 16px 0 12px; font-family: sans-serif;">
                OMENORA Relationship Weather is for self-reflection and personal exploration only. It is not a substitute for professional advice, therapy, or relationship counselling.
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
    subject: `Your relationship weather for ${weekLabel}`,
    html: htmlContent,
    text: [
      `OMENORA — Relationship Weather`,
      `Week of ${weekLabel}`,
      ``,
      weekTheme || '',
      ``,
      `CONNECTION`,
      connection || '',
      ``,
      `COMMUNICATION`,
      communication || '',
      ``,
      `TENSION`,
      tension || '',
      ``,
      `ADVICE`,
      advice || '',
      ``,
      `---`,
      compatibilityTitle ? `Based on your ${compatibilityTitle} reading · Compatibility Plus` : 'Compatibility Plus',
      ``,
      `OMENORA · omenora.com`,
      `To unsubscribe: ${unsubUrl}`,
    ].join('\n'),
  })

  if (error) {
    console.error('[send-weekly-transit] Resend error:', error?.message, error?.name)
    throw createError({ statusCode: 500, message: 'Failed to send weekly transit email' })
  }

  return { success: true }
})
