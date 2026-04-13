/**
 * Mobile — Verify Stripe Checkout Session
 *
 * Called by the app after it receives the omenora://payment/success deep link.
 * Re-retrieves the Checkout Session server-side to confirm payment — never trust
 * the client URL alone.
 *
 * POST /api/mobile/verify-checkout-session
 */
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const sessionId = sanitizeString(body.sessionId, 200)

  assertInput(
    /^cs_(live|test)_[A-Za-z0-9_]{10,400}$/.test(sessionId),
    'Invalid checkout session ID',
  )

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    throw createError({ statusCode: 404, message: 'Checkout session not found' })
  }

  const paid = session.payment_status === 'paid'

  return {
    paid,
    sessionId:     session.id,
    amount:        session.amount_total,
    currency:      session.currency,
    customerEmail: session.customer_email,
    metadata:      paid ? session.metadata : null,
  }
})
