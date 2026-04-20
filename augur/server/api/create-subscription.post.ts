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

  try {
    let customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]!
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
          customer = retry.data[0]!
        } else {
          throw err
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{ price: config.stripeDailyPriceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${base}/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${base}/report`,
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
  } catch (err: any) {
    const stripeCode = err?.code as string | undefined
    const status     = err?.statusCode ?? err?.status ?? 0

    if (stripeCode === 'rate_limit') {
      throw createError({ statusCode: 429, message: 'Payment service busy — please try again in a moment.' })
    }
    if (status === 401 || status === 403 || stripeCode === 'authentication_required') {
      console.error('[create-subscription] Stripe auth error:', err?.message)
      throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable.' })
    }
    if (stripeCode === 'resource_missing') {
      console.error('[create-subscription] Invalid Stripe price ID:', config.stripeDailyPriceId)
      throw createError({ statusCode: 503, message: 'Subscription product not configured. Please contact support.' })
    }
    if (status >= 500 || err?.type === 'StripeConnectionError' || err?.type === 'StripeAPIError') {
      throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable — please try again.' })
    }

    console.error('[create-subscription] Unexpected Stripe error:', { code: stripeCode, status, message: err?.message })
    throw createError({ statusCode: 500, message: 'Failed to create subscription session.' })
  }
})
