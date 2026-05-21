import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const archetype      = sanitizeString(body.archetype, 30)
  const email          = sanitizeString(body.email, 254)
  const lifePathNumber = sanitizeString(String(body.lifePathNumber ?? ''), 5)
  const originRaw      = sanitizeString(body.origin, 300)
  const dateOfBirth    = sanitizeString(body.dateOfBirth ?? '', 20)
  const timeOfBirth    = sanitizeString(body.timeOfBirth ?? '', 20)
  const city           = sanitizeString(body.city ?? '', 100)
  const element        = sanitizeString(body.element ?? '', 20)
  const region         = sanitizeString(body.region ?? '', 20)
  const plan           = sanitizeString(body.plan ?? 'monthly', 10)

  const utmSource   = sanitizeString(body.utm_source   ?? '', 200)
  const utmCampaign = sanitizeString(body.utm_campaign  ?? '', 200)
  const utmAdset    = sanitizeString(body.utm_adset     ?? '', 200)
  const utmCreative = sanitizeString(body.utm_creative  ?? '', 200)
  const utmMedium   = sanitizeString(body.utm_medium    ?? '', 200)
  const utmContent  = sanitizeString(body.utm_content   ?? '', 200)

  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')
  assertInput(plan === 'monthly' || plan === 'yearly', 'Invalid plan')

  const base = safeOrigin(originRaw)

  const priceId = plan === 'yearly'
    ? config.stripePremiumYearlyPriceId
    : config.stripePremiumMonthlyPriceId

  assertInput(!!priceId, 'Premium price not configured — contact support')

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
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: { trial_period_days: 7 },
      success_url: `${base}/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${base}/subscribe`,
      metadata: {
        firstName,
        archetype,
        lifePathNumber,
        email,
        customerId: customer.id,
        type: 'subscription',
        plan,
        dateOfBirth,
        timeOfBirth,
        city,
        element,
        region,
        ...(utmSource   && { utm_source:   utmSource }),
        ...(utmCampaign && { utm_campaign:  utmCampaign }),
        ...(utmAdset    && { utm_adset:     utmAdset }),
        ...(utmCreative && { utm_creative:  utmCreative }),
        ...(utmMedium   && { utm_medium:    utmMedium }),
        ...(utmContent  && { utm_content:   utmContent }),
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
      console.error('[create-subscription] Invalid Stripe price ID:', priceId)
      throw createError({ statusCode: 503, message: 'Subscription product not configured. Please contact support.' })
    }
    if (status >= 500 || err?.type === 'StripeConnectionError' || err?.type === 'StripeAPIError') {
      throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable — please try again.' })
    }

    console.error('[create-subscription] Unexpected Stripe error:', { code: stripeCode, status, message: err?.message })
    throw createError({ statusCode: 500, message: 'Failed to create subscription session.' })
  }
})
