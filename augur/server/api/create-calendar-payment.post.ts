import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const firstName = sanitizeString(body.firstName, 50)
  const email     = sanitizeString(body.email, 254)
  const tempId    = sanitizeString(body.tempId, 100)
  const language  = sanitizeString(body.language || 'en', 5)
  const originRaw = sanitizeString(body.origin, 300)

  assertInput(!!firstName, 'firstName is required')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  const base = safeOrigin(originRaw)

  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2026-03-25.dahlia',
  })

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'OMENORA 2026 Lucky Timing Calendar',
            description: 'Complete month-by-month destiny forecast',
          },
          unit_amount: 299,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${base}/calendar?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/report`,
      customer_email: isValidEmail(email) ? email : undefined,
      metadata: {
        firstName,
        email: isValidEmail(email) ? email : '',
        tempId,
        language,
        type: 'calendar',
      },
    })
  } catch (err: any) {
    const code   = err?.code as string | undefined
    const status = err?.statusCode ?? err?.status ?? 0
    if (code === 'rate_limit') throw createError({ statusCode: 429, message: 'Payment service busy — please try again.' })
    if (status === 401 || status === 403) throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable.' })
    if (status >= 500 || err?.type === 'StripeConnectionError' || err?.type === 'StripeAPIError') throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable — please try again.' })
    console.error('[create-calendar-payment] Stripe error:', { code, status, message: err?.message })
    throw createError({ statusCode: 500, message: 'Failed to create payment session.' })
  }

  return { sessionId: session.id, url: session.url }
})
