import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const archetype      = sanitizeString(body.archetype, 30)
  const email          = sanitizeString(body.email, 254)
  const lifePathNumber = sanitizeString(String(body.lifePathNumber ?? ''), 5)
  const originRaw      = sanitizeString(body.origin, 300)

  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  const base = safeOrigin(originRaw)

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  let customer
  const existingCustomers = await stripe.customers.list({ email, limit: 1 })

  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0]!
  } else {
    customer = await stripe.customers.create({
      email,
      name: firstName,
      metadata: {
        archetype,
        lifePathNumber,
      },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [{ price: config.stripeDailyPriceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${base}/subscription?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/report`,
    metadata: {
      firstName,
      archetype,
      lifePathNumber,
      email,
      customerId: customer.id,
      type: 'subscription',
    },
  })

  return { sessionId: session.id, url: session.url }
})
