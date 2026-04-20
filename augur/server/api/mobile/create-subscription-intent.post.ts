/**
 * Mobile — Create Subscription Intent
 *
 * Creates (or retrieves) a Stripe Customer, then creates a Subscription
 * with `payment_behavior: 'default_incomplete'`. This generates an invoice
 * whose PaymentIntent clientSecret the React Native app uses with
 * @stripe/stripe-react-native PaymentSheet — no browser redirect needed.
 *
 * After the PaymentSheet succeeds, the subscription automatically becomes
 * active on Stripe's side. Call /api/mobile/confirm-subscription with
 * the subscriptionId to verify server-side.
 *
 * POST /api/mobile/create-subscription-intent
 */
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  // ── Validate ─────────────────────────────────────────────────────────────
  const email          = sanitizeString(body.email, 254)
  const firstName      = sanitizeString(body.firstName, 50)
  const archetype      = sanitizeString(body.archetype, 30)
  const lifePathNumber = sanitizeString(String(body.lifePathNumber ?? ''), 5)

  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(!!firstName, 'firstName is required')

  if (!config.stripeDailyPriceId) {
    throw createError({ statusCode: 500, message: 'Subscription price not configured' })
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  // ── Find or create Stripe Customer (race-safe) ───────────────────────────────
  let customer: Stripe.Customer
  const existing = await stripe.customers.list({ email, limit: 1 })

  if (existing.data.length > 0) {
    customer = existing.data[0] as Stripe.Customer
  } else {
    try {
      customer = await stripe.customers.create({
        email,
        name: firstName,
        metadata: { archetype, lifePathNumber },
      })
    } catch (err: any) {
      // Under concurrent requests the customer may have been created between
      // the list() and create() calls — re-fetch rather than failing.
      const msg = (err?.message ?? '').toLowerCase()
      if (msg.includes('already') || msg.includes('exists')) {
        const retry = await stripe.customers.list({ email, limit: 1 })
        if (!retry.data[0]) throw err
        customer = retry.data[0] as Stripe.Customer
      } else {
        throw err
      }
    }
  }

  // ── Create an incomplete Subscription ────────────────────────────────────
  // Stripe creates an Invoice + PaymentIntent automatically.
  // We return the PaymentIntent clientSecret so the app can present
  // a native PaymentSheet without any browser redirect.
  const subscription = await stripe.subscriptions.create({
    customer:         customer.id,
    items:            [{ price: config.stripeDailyPriceId as string }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand:           ['latest_invoice.payment_intent'],
    metadata: {
      firstName,
      archetype,
      lifePathNumber,
      email,
      type:     'subscription',
      platform: 'mobile',
    },
  })

  // ── Extract clientSecret from the expanded invoice PaymentIntent ──────────
  // Stripe expands `latest_invoice.payment_intent` at runtime via the `expand` option.
  // The SDK type for Invoice doesn't declare payment_intent in this version, hence the cast.
  const invoice       = subscription.latest_invoice as Record<string, unknown> | null
  const paymentIntent = (invoice?.payment_intent ?? null) as Stripe.PaymentIntent | null

  if (!paymentIntent?.client_secret) {
    throw createError({
      statusCode: 500,
      message: 'Failed to generate subscription payment intent',
    })
  }

  return {
    clientSecret:   paymentIntent.client_secret,
    publishableKey: config.public.stripePublishableKey,
    customerId:     customer.id,
    subscriptionId: subscription.id,
  }
})
