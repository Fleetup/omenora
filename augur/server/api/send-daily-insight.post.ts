import { Resend } from 'resend'

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
  const insight   = body.insight && typeof body.insight === 'object' ? body.insight : null

  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(insight !== null, 'insight object is required')

  const resend = new Resend(config.resendApiKey)

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Daily OMENORA Insight</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: system-ui, -apple-system, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <p style="font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.2); letter-spacing: 0.15em; margin: 0;">OMENORA</p>
      <p style="font-size: 11px; color: rgba(140,110,255,0.6); margin: 0;">${insight.moonPhase} · ${insight.dayTheme}</p>
    </div>

    <p style="font-size: 22px; font-weight: 500; color: rgba(230,220,255,0.95); margin: 0 0 20px;">${insight.greeting}</p>

    <p style="font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.8; margin: 0 0 28px;">${insight.insight}</p>

    <div style="text-align: center; padding: 20px; background: rgba(140,110,255,0.04); border: 1px solid rgba(140,110,255,0.1); border-radius: 12px; margin-bottom: 32px;">
      <p style="font-size: 10px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px;">A question worth sitting with</p>
      <p style="font-size: 15px; font-weight: 400; font-style: italic; color: rgba(200,180,255,0.85); margin: 0; line-height: 1.6;">${insight.reflection_question || insight.action || ''}</p>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 40px; padding-top: 24px; text-align: center;">
      <p style="color: rgba(255,255,255,0.25); font-size: 11px; line-height: 1.7; font-family: Inter, sans-serif; margin: 0 0 12px; max-width: 480px; margin-left: auto; margin-right: auto;">
        OMENORA Daily Insights are for self-reflection and personal exploration only. They are not a substitute for professional advice, therapy, or medical care. If you are experiencing a mental health crisis, support is available 24/7 at 988 (call or text).
      </p>
      <p style="color: rgba(255,255,255,0.2); font-size: 11px; font-family: Inter, sans-serif; margin: 0;">
        <a href="mailto:unsubscribe@omenora.com?subject=unsubscribe&body=${encodeURIComponent(email)}" style="color: rgba(255,255,255,0.3); text-decoration: underline;">Unsubscribe</a>
        &nbsp;·&nbsp; omenora.com
      </p>
    </div>
  </div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'OMENORA <reading@omenora.com>',
    replyTo: 'support@omenora.com',
    to: [email],
    subject: insight.subject || `Your daily insight from OMENORA — ${insight.dayTheme || 'today'}`,
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
      `To unsubscribe: mailto:unsubscribe@omenora.com?subject=unsubscribe`,
    ].join('\n'),
  })

  if (error) {
    console.error('Daily insight email error:', error)
    throw createError({ statusCode: 500, message: 'Failed to send daily insight' })
  }

  return { success: true }
})
