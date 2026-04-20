/**
 * Mobile — Create PaymentIntent
 *
 * Used by the React Native / Expo app instead of the Stripe Checkout Session flow.
 * Returns a clientSecret the app passes to @stripe/stripe-react-native PaymentSheet.
 * No browser redirect is involved — the native payment sheet opens inside the app.
 *
 * POST /api/mobile/create-payment-intent
 */
import Stripe from 'stripe'

// ── Product catalog ────────────────────────────────────────────────────────

const ALLOWED_TYPES = [
  'report', 'oracle', 'bundle', 'calendar',
  'compatibility', 'addon', 'birth_chart',
] as const

type ProductType = (typeof ALLOWED_TYPES)[number]

const PRODUCTS: Record<ProductType, { amount: number; name: string; description: string }> = {
  report:        { amount: 199,  name: 'OMENORA Destiny Report — Basic',       description: 'Complete destiny analysis' },
  oracle:        { amount: 1299, name: 'OMENORA Full Oracle Bundle',           description: 'Report + Calendar + Compatibility + Birth Chart + 30 Daily Insights' },
  bundle:        { amount: 499,  name: 'OMENORA Most Popular Bundle',          description: 'Complete destiny report + 2026 Calendar + Compatibility Reading' },
  calendar:      { amount: 299,  name: 'OMENORA 2026 Lucky Timing Calendar',   description: 'Complete month-by-month destiny forecast' },
  compatibility: { amount: 299,  name: 'OMENORA Compatibility Reading',        description: 'Destiny Compatibility Analysis' },
  addon:         { amount: 99,   name: 'OMENORA Compatibility Add-on',         description: 'Add compatibility reading to your order' },
  birth_chart:   { amount: 299,  name: 'OMENORA Full Birth Chart',             description: 'Rising sign · Moon sign · Houses · Planetary positions · 2026 forecast' },
}

// ──────────────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  // ── Validate inputs ──────────────────────────────────────────────────────
  const type           = sanitizeString(body.type, 30)
  const firstName      = sanitizeString(body.firstName, 50)
  const email          = sanitizeString(body.email, 254)
  const archetype      = sanitizeString(body.archetype, 30)
  const tempId         = sanitizeString(body.tempId, 100)
  const region         = isValidRegion(body.region) ? body.region : 'western'
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const lifePathNumber = sanitizeString(String(body.lifePathNumber ?? ''), 5)
  const timeOfBirth    = sanitizeString(body.timeOfBirth, 10)
  const partnerName    = sanitizeString(body.partnerName, 50)

  assertInput(ALLOWED_TYPES.includes(type as ProductType), 'Invalid product type')
  assertInput(!!firstName, 'firstName is required')

  const product = PRODUCTS[type as ProductType]!

  // ── Create PaymentIntent ─────────────────────────────────────────────────
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount:   product.amount,
      currency: 'usd',
      // Automatic payment methods enable Apple Pay + Google Pay automatically
      automatic_payment_methods: { enabled: true },
      description: product.name,
      receipt_email: isValidEmail(email) ? email : undefined,
      metadata: {
        type,
        firstName,
        email:          isValidEmail(email) ? email : '',
        archetype,
        tempId,
        region,
        dateOfBirth,
        lifePathNumber,
        timeOfBirth,
        partnerName,
        // Flags that match the web payment session metadata shape
        bundle:      ['oracle', 'bundle'].includes(type) ? 'true' : '',
        oracle:      type === 'oracle' ? 'true' : '',
        birth_chart: type === 'birth_chart' ? 'true' : '',
        platform:    'mobile',
      },
    })
  } catch (err: any) {
    const code   = err?.code as string | undefined
    const status = err?.statusCode ?? err?.status ?? 0
    if (code === 'rate_limit') throw createError({ statusCode: 429, message: 'Payment service busy — please try again.' })
    if (status === 401 || status === 403) throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable.' })
    if (status >= 500 || err?.type === 'StripeConnectionError' || err?.type === 'StripeAPIError') throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable — please try again.' })
    console.error('[mobile/create-payment-intent] Stripe error:', { code, status, message: err?.message })
    throw createError({ statusCode: 500, message: 'Failed to create payment intent.' })
  }

  return {
    clientSecret:    paymentIntent.client_secret,
    publishableKey:  config.public.stripePublishableKey,
    paymentIntentId: paymentIntent.id,
    amount:          product.amount,
    productName:     product.name,
  }
})
