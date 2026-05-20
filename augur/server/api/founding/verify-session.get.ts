/**
 * GET /api/founding/verify-session?session_id={cs_...}
 *
 * Verifies that a Stripe Checkout session corresponds to a paid
 * founding_members row. Called by /founding/thank-you on mount to
 * prevent direct-URL visitors from seeing success content without paying.
 *
 * Rate-limited at 10 req / 15 min per the /api/founding/ rule in
 * 02.rate-limit.ts — no additional config needed.
 *
 * Response payloads:
 *   200 { status: 'paid',    email: 'm***@example.com', purchasedAt: ISO }
 *   200 { status: 'pending' }
 *   200 { status: 'refunded' | 'disputed' }
 *   404 { status: 'not_found' }
 *
 * PII policy: only the masked email and purchase timestamp are returned.
 * No Stripe IDs, UTM fields, or internal metadata are exposed.
 */

/** Mask a plain email: first char of local part + *** + @ + full domain. */
function maskEmail(raw: string): string {
  const at = raw.indexOf('@')
  if (at < 1) return '***@***'
  const local  = raw.slice(0, at)
  const domain = raw.slice(at + 1)
  return `${local[0]}***@${domain}`
}

export default defineEventHandler(async (event) => {
  const query     = getQuery(event)
  const sessionId = typeof query.session_id === 'string' ? query.session_id.trim() : ''

  // ── Guard: session_id is required and must look like a Stripe session id ────
  if (!sessionId || !sessionId.startsWith('cs_')) {
    throw createError({ statusCode: 400, message: 'session_id is required and must be a valid Stripe checkout session id.' })
  }

  // ── Lookup in founding_members ─────────────────────────────────────────────
  const supabase = createSupabaseAdmin()
  const { data: row, error } = await supabase
    .from('founding_members')
    .select('status, email, paid_at')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('[verify-session] DB lookup error:', { sessionId, error: error.message })
    throw createError({ statusCode: 500, message: 'Internal error verifying session.' })
  }

  if (!row) {
    console.info('[verify-session] session not found:', sessionId)
    throw createError({ statusCode: 404, message: 'not_found' })
  }

  console.info('[verify-session] status lookup:', { sessionId, status: row.status })

  if (row.status === 'paid') {
    return {
      status:      'paid' as const,
      email:       maskEmail(row.email ?? ''),
      purchasedAt: row.paid_at as string,
    }
  }

  // pending / refunded / disputed — return status only, no PII
  return { status: row.status as string }
})
