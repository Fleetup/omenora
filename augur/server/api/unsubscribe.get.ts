import { cancelEmailJobs } from '~~/server/utils/email-jobs'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Returns a 32-char hex HMAC-SHA256 token for the given email.
 * Signs unsubscribe links so raw email addresses never appear in URLs,
 * server logs, CDN access logs, or browser history.
 */
export function unsubscribeToken(email: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(email.toLowerCase().trim())
    .digest('hex')
    .slice(0, 32)
}

export default defineEventHandler(async (event) => {
  const config   = useRuntimeConfig()
  const query    = getQuery(event)
  const rawToken = (query.token as string | undefined) ?? ''
  const rawEmail = (query.e    as string | undefined) ?? ''

  if (!rawToken || !rawEmail) {
    return sendRedirect(event, '/?unsubscribed=true')
  }

  const email  = sanitizeString(decodeURIComponent(rawEmail), 254)
  const secret = (config.emailJobSecret as string | undefined) ?? ''

  if (!isValidEmail(email) || !secret) {
    return sendRedirect(event, '/?unsubscribed=true')
  }

  const expected = Buffer.from(unsubscribeToken(email, secret))
  const provided = Buffer.from(sanitizeString(rawToken, 64).slice(0, 32))

  const tokensMatch =
    expected.length === provided.length &&
    timingSafeEqual(expected, provided)

  if (!tokensMatch) {
    return sendRedirect(event, '/?unsubscribed=true')
  }

  const supabase = createSupabaseAdmin()

  await Promise.all([
    supabase
      .from('email_captures')
      .update({
        sequence_completed: true,
        updated_at:         new Date().toISOString(),
      })
      .eq('email', email.toLowerCase().trim()),

    cancelEmailJobs(email),
  ])

  try {
    const { error: subErr } = await supabase
      .from('subscribers')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())

    if (subErr) {
      console.error('[unsubscribe] Failed to deactivate subscriber:', subErr.code)
    }
  } catch (err: any) {
    console.error('[unsubscribe] Unexpected error deactivating subscriber:', err?.message)
  }

  return sendRedirect(event, '/?unsubscribed=true')
})
