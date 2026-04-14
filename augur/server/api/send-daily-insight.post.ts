import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { email, firstName: _firstName, insight, archetype } = body

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

    <div style="padding: 16px 20px; background: rgba(140,110,255,0.06); border: 1px solid rgba(140,110,255,0.15); border-radius: 12px; margin-bottom: 24px;">
      <p style="font-size: 10px; font-weight: 500; color: rgba(140,110,255,0.6); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 6px;">Today's Focus</p>
      <p style="font-size: 14px; color: rgba(200,180,255,0.85); margin: 0; line-height: 1.5;">${insight.action}</p>
    </div>

    <div style="text-align: center; padding: 20px; background: rgba(140,110,255,0.04); border: 1px solid rgba(140,110,255,0.1); border-radius: 12px; margin-bottom: 32px;">
      <p style="font-size: 10px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">Today's Frequency</p>
      <p style="font-size: 17px; font-weight: 500; font-style: italic; color: rgba(200,180,255,0.9); margin: 0; line-height: 1.4;">"${insight.frequency}"</p>
    </div>

    <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.04);">
      <p style="font-size: 11px; color: rgba(255,255,255,0.1); margin: 0 0 4px;">omenora.com — Daily Destiny Insights</p>
      <p style="font-size: 10px; color: rgba(255,255,255,0.07); margin: 0;">${email} · ${archetype}</p>
    </div>
  </div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'OMENORA <onboarding@resend.dev>',
    to: [process.env.RESEND_TEST_EMAIL || email],
    subject: `${insight.greeting} ${insight.dayTheme}`,
    html: htmlContent,
  })

  if (error) {
    console.error('Daily insight email error:', error)
    throw createError({ statusCode: 500, message: 'Failed to send daily insight' })
  }

  return { success: true }
})
