/**
 * Mobile — Create Stripe Checkout Session
 *
 * Opens a Stripe-hosted payment page in the device's browser (Safari / Chrome).
 * This replaces the native PaymentSheet approach, avoids Apple/Google IAP fees,
 * and is fully compliant with App Store rules for US/EU storefronts (2025).
 *
 * Flow: app calls this endpoint → opens session.url in Safari → user pays →
 *       Stripe redirects to omenora://payment/success?session_id=... → app verifies.
 *
 * POST /api/mobile/create-checkout-session
 */
import Stripe from 'stripe'

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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const type           = sanitizeString(body.type, 30)
  const firstName      = sanitizeString(body.firstName, 50)
  const email          = sanitizeString(body.email, 254)
  const archetype      = sanitizeString(body.archetype, 30)
  const tempId         = sanitizeString(body.tempId, 100)
  const region         = isValidRegion(body.region) ? body.region : 'western'
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const lifePathNumber = sanitizeString(String(body.lifePathNumber ?? ''), 5)
  const timeOfBirth    = sanitizeString(body.timeOfBirth || '', 10)
  const partnerName    = sanitizeString(body.partnerName || '', 50)

  assertInput(ALLOWED_TYPES.includes(type as ProductType), 'Invalid product type')
  assertInput(!!firstName, 'firstName is required')
  assertInput(!!email && isValidEmail(email), 'Valid email is required')

  const product = PRODUCTS[type as ProductType]!

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     'usd',
          product_data: { name: product.name, description: product.description },
          unit_amount:  product.amount,
        },
        quantity: 1,
      }],
      mode:           'payment',
      // Optimises Stripe Checkout UI for app-to-web purchase context
      origin_context: 'mobile_app' as any,
      customer_email: email,
      // Deep-link back to the app after payment
      success_url: `omenora://payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `omenora://payment/cancel`,
      metadata: {
        type,
        firstName,
        email,
        archetype,
        tempId,
        region,
        dateOfBirth,
        lifePathNumber,
        timeOfBirth,
        partnerName,
        bundle:      ['oracle', 'bundle'].includes(type) ? 'true' : '',
        oracle:      type === 'oracle'      ? 'true' : '',
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
    console.error('[mobile/create-checkout-session] Stripe error:', { code, status, message: err?.message })
    throw createError({ statusCode: 500, message: 'Failed to create checkout session.' })
  }

  return {
    url:       session.url,
    sessionId: session.id,
  }
})
