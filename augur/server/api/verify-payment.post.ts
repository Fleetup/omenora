import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId = sanitizeString(body.sessionId, 200)
  assertInput(isValidSessionId(sessionId), 'Invalid session ID')

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
      paid: session.payment_status === 'paid' || session.status === 'complete',
      customerEmail: session.customer_email,
      metadata: session.metadata,
    }
  } catch {
    throw createError({ statusCode: 404, message: 'Session not found' })
  }
})
