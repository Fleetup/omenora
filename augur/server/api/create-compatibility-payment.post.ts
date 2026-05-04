import Stripe from 'stripe'

const VALID_TIERS  = ['single', 'with_charts'] as const
type Tier          = typeof VALID_TIERS[number]
const TIER_PRICES: Record<Tier, number> = { single: 999, with_charts: 1499 }

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // ── Raw field extraction ──────────────────────────────────────────────────

  const firstName   = sanitizeString(body.firstName, 50)
  const partnerName = sanitizeString(body.partnerName, 50)
  const email       = sanitizeString(body.email, 254)
  const tempId      = sanitizeString(body.tempId, 100)
  const language    = sanitizeString(body.language || 'en', 5)
  const originRaw   = sanitizeString(body.origin, 300)
  const partnerCity        = body.partnerCity        != null ? sanitizeString(body.partnerCity, 100)        : ''
  const partnerDob         = body.partnerDob         != null ? sanitizeString(body.partnerDob, 10)          : ''
  const dateOfBirth        = body.dateOfBirth        != null ? sanitizeString(body.dateOfBirth, 10)         : ''
  const city               = body.city               != null ? sanitizeString(body.city, 100)               : ''
  const timeOfBirth        = body.timeOfBirth        != null ? sanitizeString(body.timeOfBirth, 10)         : ''
  const partnerTimeOfBirth = body.partnerTimeOfBirth != null ? sanitizeString(body.partnerTimeOfBirth, 10)  : ''
  const utmCreative        = sanitizeString(body.utmCreative  || '', 100)
  const utmSource    = sanitizeString(body.utmSource    || '', 100)
  const utmCampaign  = sanitizeString(body.utmCampaign  || '', 100)
  const utmMedium    = sanitizeString(body.utmMedium    || '', 100)

  const rawTier = sanitizeString(body.tier ?? '', 20)
  assertInput(
    (VALID_TIERS as readonly string[]).includes(rawTier),
    'Invalid tier — must be "single" or "with_charts"',
  )
  const tier: Tier = rawTier as Tier

  // ── Input validation ──────────────────────────────────────────────────────

  assertInput(!!firstName, 'firstName is required')
  assertInput(!!partnerName, 'partnerName is required')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  if (partnerDob) {
    assertInput(isValidDateOfBirth(partnerDob), 'Invalid partnerDob — expected YYYY-MM-DD')
  }
  if (tier === 'with_charts') {
    assertInput(isValidDateOfBirth(dateOfBirth), 'dateOfBirth is required for with_charts tier')
  }

  const base = safeOrigin(originRaw)

  // ── Shared metadata ───────────────────────────────────────────────────────

  const metadata: Record<string, string> = {
    firstName,
    partnerName,
    email: isValidEmail(email) ? email : '',
    tempId,
    language,
    type: 'compatibility',
    tier,
    ...(partnerDob         ? { partnerDob }                        : {}),
    ...(partnerCity        ? { partnerCity }                       : {}),
    ...(dateOfBirth        ? { dateOfBirth }                       : {}),
    ...(city               ? { city }                              : {}),
    ...(timeOfBirth        ? { timeOfBirth }                       : {}),
    ...(partnerTimeOfBirth ? { partnerTimeOfBirth }                : {}),
    ...(utmCreative        ? { utm_creative: utmCreative }         : {}),
    ...(utmSource    ? { utm_source:   utmSource }   : {}),
    ...(utmCampaign  ? { utm_campaign: utmCampaign } : {}),
    ...(utmMedium    ? { utm_medium:   utmMedium }   : {}),
  }

  // ── Stripe session construction ───────────────────────────────────────────

  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2026-03-25.dahlia',
  })

  let sessionParams: Stripe.Checkout.SessionCreateParams

  sessionParams = {
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: tier === 'with_charts'
            ? 'OMENORA Compatibility Reading + Birth Charts'
            : 'OMENORA Compatibility Reading',
          description: tier === 'with_charts'
            ? 'Destiny Compatibility Analysis — includes full natal birth charts for both you and your partner'
            : 'Destiny Compatibility Analysis',
        },
        unit_amount: TIER_PRICES[tier],
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${base}/compatibility?session_id={CHECKOUT_SESSION_ID}&from=quiz`,
    cancel_url:  `${base}/compatibility?canceled=1`,
    customer_email: isValidEmail(email) ? email : undefined,
    metadata,
  }

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
  try {
    session = await stripe.checkout.sessions.create(sessionParams)
  } catch (err: any) {
    const code   = err?.code as string | undefined
    const status = err?.statusCode ?? err?.status ?? 0
    if (code === 'rate_limit') throw createError({ statusCode: 429, message: 'Payment service busy — please try again.' })
    if (status === 401 || status === 403) throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable.' })
    if (code === 'resource_missing') {
      console.error('[create-compatibility-payment] Invalid Stripe price ID for tier:', tier)
      throw createError({ statusCode: 503, message: 'Payment product not configured. Please contact support.' })
    }
    if (status >= 500 || err?.type === 'StripeConnectionError' || err?.type === 'StripeAPIError') throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable — please try again.' })
    console.error('[create-compatibility-payment] Stripe error:', { code, status, message: err?.message })
    throw createError({ statusCode: 500, message: 'Failed to create payment session.' })
  }

  return { sessionId: session.id, url: session.url }
})
