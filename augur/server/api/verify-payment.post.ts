import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId = sanitizeString(body.sessionId, 200)
  assertInput(isValidSessionId(sessionId), 'Invalid session ID')

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paid = session.payment_status === 'paid' || session.status === 'complete'

    // Return only the fields the client legitimately needs.
    // Internal promo fields (promo_code, code_id, discount_applied, tempId,
    // original_tier) are never forwarded to the browser.
    const raw = session.metadata ?? {}
    const metadata: Record<string, string> = {}
    const ALLOWED_META_KEYS = [
      'firstName', 'archetype', 'lifePathNumber', 'region', 'language',
      'dateOfBirth', 'bundle', 'oracle', 'birth_chart', 'type',
      'tradition_switch', 'newTradition', 'reportId', 'customerId',
      'email', 'partnerName',
    ]
    for (const key of ALLOWED_META_KEYS) {
      if (raw[key] !== undefined) metadata[key] = raw[key]!
    }

    return {
      paid,
      customerEmail: session.customer_email,
      metadata: paid ? metadata : null,
    }
  } catch {
    throw createError({ statusCode: 404, message: 'Session not found' })
  }
})
