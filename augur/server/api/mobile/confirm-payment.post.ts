/**
 * Mobile — Confirm PaymentIntent
 *
 * Called by the React Native app after @stripe/stripe-react-native PaymentSheet
 * reports a successful result. The server re-retrieves the PaymentIntent from
 * Stripe to verify the status server-side (never trust the client alone).
 *
 * Returns the PaymentIntent metadata in the same shape as the web
 * verify-payment endpoint so shared business logic can be reused.
 *
 * POST /api/mobile/confirm-payment
 */
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  // ── Validate ─────────────────────────────────────────────────────────────
  const paymentIntentId = sanitizeString(body.paymentIntentId, 100)

  assertInput(
    /^pi_(?:live|test)_\w{10,200}$/.test(paymentIntentId),
    'Invalid payment intent ID',
  )

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  // ── Server-side verification — never trust the mobile client's report ────
  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch {
    throw createError({ statusCode: 404, message: 'Payment intent not found' })
  }

  const paid = paymentIntent.status === 'succeeded'

  return {
    paid,
    paymentIntentId: paymentIntent.id,
    amount:          paymentIntent.amount,
    currency:        paymentIntent.currency,
    // Metadata shape mirrors web verify-payment for compatibility
    metadata: paid ? paymentIntent.metadata : null,
    customerEmail: paymentIntent.receipt_email,
  }
})
