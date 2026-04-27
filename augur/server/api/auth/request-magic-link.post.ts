/**
 * POST /api/auth/request-magic-link
 *
 * Sends a Supabase magic link email to the supplied address so the user
 * can sign in to their account without a password.
 *
 * Security: always returns { success: true } regardless of whether the
 * email exists in Supabase — never reveal account existence to callers.
 *
 * Input:  { email: string }
 * Output: { success: true }
 */
import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const email = sanitizeString(body.email ?? '', 254)

  assertInput(isValidEmail(email), 'Valid email is required')

  const supabase = createSupabaseAdmin()

  // generateLink returns a magic link for existing users, or fails silently
  // for non-existent emails — we swallow that error to avoid user enumeration.
  let magicLinkUrl: string | null = null

  try {
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (!linkErr && linkData?.properties?.hashed_token) {
      // Send the user directly to our own /account page with the token_hash as
      // a query param. account.vue calls supabase.auth.verifyOtp() on mount —
      // the same pattern used in provisionUser(). This bypasses the Supabase
      // /auth/v1/verify redirect entirely so PKCE/implicit flow settings and
      // the Supabase dashboard Site URL have zero effect on where the user lands.
      const token = encodeURIComponent(linkData.properties.hashed_token)
      magicLinkUrl = `https://omenora.com/account?token_hash=${token}`
    } else if (linkErr) {
      // Log internally but do not surface to caller
      console.error('[request-magic-link] generateLink error:', linkErr.code)
    }
  } catch (err: any) {
    console.error('[request-magic-link] Unexpected error generating link:', err?.message)
  }

  // Only send the email if we successfully generated a link.
  // If the email doesn't exist in auth, magicLinkUrl is null — we return
  // success anyway so callers cannot enumerate accounts.
  if (magicLinkUrl) {
    const resend = new Resend(config.resendApiKey as string)

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in to OMENORA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: system-ui, -apple-system, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto; padding: 48px 24px;">

    <p style="font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.25);
      letter-spacing: 0.15em; margin: 0 0 32px; text-align: center;">
      OMENORA
    </p>

    <h1 style="font-size: 20px; font-weight: 400; color: rgba(230,220,255,0.9);
      margin: 0 0 12px; text-align: center; line-height: 1.4;">
      Sign in to your account
    </h1>

    <p style="font-size: 14px; color: rgba(255,255,255,0.4); margin: 0 0 32px;
      text-align: center; line-height: 1.6;">
      Click the button below to sign in. This link expires in 1 hour and can only be used once.
    </p>

    <div style="text-align: center; margin-bottom: 40px;">
      <a href="${magicLinkUrl}"
        style="display: inline-block; background: rgba(140,110,255,0.85);
          color: #fff; font-size: 15px; font-weight: 500;
          text-decoration: none; padding: 14px 32px;
          border-radius: 8px; letter-spacing: 0.02em;">
        Sign in to OMENORA &rarr;
      </a>
    </div>

    <p style="font-size: 12px; color: rgba(255,255,255,0.2); text-align: center;
      margin: 0 0 8px; line-height: 1.6;">
      If you didn&rsquo;t request this, you can safely ignore this email.
    </p>

    <div style="border-top: 1px solid rgba(255,255,255,0.05); margin-top: 40px;
      padding-top: 20px; text-align: center;">
      <p style="font-size: 11px; color: rgba(255,255,255,0.12); margin: 0;">
        omenora.com &mdash; Questions? <a href="mailto:support@omenora.com"
          style="color: rgba(140,110,255,0.4); text-decoration: underline;">support@omenora.com</a>
      </p>
    </div>

  </div>
</body>
</html>`

    const plainText = [
      'OMENORA — Sign in to your account',
      '',
      'Click the link below to sign in. This link expires in 1 hour.',
      '',
      magicLinkUrl,
      '',
      'If you didn\'t request this, you can safely ignore this email.',
      '',
      '---',
      'omenora.com · support@omenora.com',
    ].join('\n')

    try {
      const { error: sendErr } = await resend.emails.send({
        from: 'OMENORA <reading@omenora.com>',
        replyTo: 'support@omenora.com',
        to: [email],
        subject: 'Sign in to OMENORA',
        html: htmlContent,
        text: plainText,
      })

      if (sendErr) {
        console.error('[request-magic-link] Resend error:', sendErr.message, sendErr.name)
      }
    } catch (sendErr: any) {
      console.error('[request-magic-link] Unexpected send error:', sendErr?.message)
    }
  }

  // Always succeed — never reveal whether the email exists in our system
  return { success: true }
})
