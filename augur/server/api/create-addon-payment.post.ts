import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const firstName = sanitizeString(body.firstName, 50)
  const email     = sanitizeString(body.email, 254)
  const language  = sanitizeString(body.language, 10) || 'en'
  const originRaw = sanitizeString(body.origin, 300)

  assertInput(!!firstName, 'firstName is required')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  const base = safeOrigin(originRaw)

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'OMENORA Compatibility Add-on',
          description: 'Add compatibility reading to your order — one-time offer',
        },
        unit_amount: 99,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${base}/compatibility?session_id={CHECKOUT_SESSION_ID}&addon=true`,
    cancel_url: `${base}/report`,
    customer_email: isValidEmail(email) ? email : undefined,
    metadata: {
      firstName,
      email: isValidEmail(email) ? email : '',
      language,
      type: 'addon',
    },
  })

  return { sessionId: session.id, url: session.url }
})
