import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const archetype      = sanitizeString(body.archetype, 30)
  const email          = sanitizeString(body.email, 254)
  const tempId         = sanitizeString(body.tempId, 100)
  const region         = isValidRegion(body.region) ? body.region : 'western'
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const lifePathNumber = sanitizeString(String(body.lifePathNumber ?? ''), 5)
  const timeOfBirth    = sanitizeString(body.timeOfBirth, 10)
  const language       = sanitizeString(body.language || 'en', 5)
  const originRaw      = sanitizeString(body.origin, 300)

  assertInput(!!firstName, 'firstName is required')
  assertInput(!!email, 'email is required')
  assertInput(isValidEmail(email), 'Invalid email')
  assertInput(isValidArchetype(body.archetype), 'Invalid archetype')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  const base = safeOrigin(originRaw)

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'OMENORA Destiny Report — Basic',
          description: `Complete destiny analysis — ${archetype}`,
        },
        unit_amount: 199,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${base}/report?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/preview`,
    customer_email: isValidEmail(email) ? email : undefined,
    metadata: {
      firstName,
      archetype,
      email: isValidEmail(email) ? email : '',
      tempId,
      region,
      dateOfBirth,
      lifePathNumber,
      timeOfBirth,
      language,
      type: 'report',
    },
  })

  return { sessionId: session.id, url: session.url }
})
