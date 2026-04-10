import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const firstName   = sanitizeString(body.firstName, 50)
  const email       = sanitizeString(body.email, 254)
  const tempId      = sanitizeString(body.tempId, 100)
  const timeOfBirth = sanitizeString(body.timeOfBirth, 10)
  const dateOfBirth = sanitizeString(body.dateOfBirth, 10)
  const language    = sanitizeString(body.language, 10) || 'en'
  const originRaw   = sanitizeString(body.origin, 300)

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
          name: 'OMENORA Full Birth Chart',
          description: 'Rising sign · Moon sign · Houses · Planetary positions · 2026 forecast',
        },
        unit_amount: 299,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${base}/report?session_id={CHECKOUT_SESSION_ID}&birth_chart=true`,
    cancel_url: `${base}/report`,
    customer_email: isValidEmail(email) ? email : undefined,
    metadata: {
      firstName,
      email: isValidEmail(email) ? email : '',
      tempId,
      timeOfBirth,
      dateOfBirth,
      language,
      birth_chart: 'true',
      type: 'birth_chart',
    },
  })

  return { sessionId: session.id, url: session.url }
})
