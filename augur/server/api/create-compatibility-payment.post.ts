import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const firstName   = sanitizeString(body.firstName, 50)
  const partnerName = sanitizeString(body.partnerName, 50)
  const email       = sanitizeString(body.email, 254)
  const tempId      = sanitizeString(body.tempId, 100)
  const language    = sanitizeString(body.language || 'en', 5)
  const originRaw   = sanitizeString(body.origin, 300)

  assertInput(!!firstName, 'firstName is required')
  assertInput(!!partnerName, 'partnerName is required')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  const base = safeOrigin(originRaw)

  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2026-03-25.dahlia',
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'OMENORA Compatibility Reading',
          description: 'Destiny Compatibility Analysis',
        },
        unit_amount: 299,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${base}/compatibility?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/report`,
    customer_email: isValidEmail(email) ? email : undefined,
    metadata: {
      firstName,
      partnerName,
      email: isValidEmail(email) ? email : '',
      tempId,
      language,
      type: 'compatibility',
    },
  })

  return { sessionId: session.id, url: session.url }
})
