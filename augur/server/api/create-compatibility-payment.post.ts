import Stripe from 'stripe'

const VALID_TIERS  = ['single'] as const
type Tier          = typeof VALID_TIERS[number]
const TIER_PRICES: Record<Tier, number> = { single: 499 }

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

  // ── New quiz answer fields (Build 5) ──────────────────────────────────────
  const quizAnswers = (body.quizAnswers && typeof body.quizAnswers === 'object')
    ? body.quizAnswers as Record<string, string>
    : {}

  // ── Coordinates needed for ascendant computation ──────────────────────────
  const cityLat        = typeof body.cityLat        === 'number' ? body.cityLat        : undefined
  const cityLng        = typeof body.cityLng        === 'number' ? body.cityLng        : undefined
  const partnerCityLat = typeof body.partnerCityLat === 'number' ? body.partnerCityLat : undefined
  const partnerCityLng = typeof body.partnerCityLng === 'number' ? body.partnerCityLng : undefined

  // ── Input validation ──────────────────────────────────────────────────────

  assertInput(!!firstName, 'firstName is required')
  assertInput(!!partnerName, 'partnerName is required')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  if (partnerDob) {
    assertInput(isValidDateOfBirth(partnerDob), 'Invalid partnerDob — expected YYYY-MM-DD')
  }
  const base = safeOrigin(originRaw)

  // ── Shared metadata ───────────────────────────────────────────────────────

  const metadata: Record<string, string> = {
    firstName,
    partnerName,
    email: isValidEmail(email) ? email : '',
    tempId,
    language,
    type: 'compat_credit',
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

    // ── New quiz answer fields (Build 5) ──────────────────────
    ...(quizAnswers.q1_intent         ? { q1_intent:         String(quizAnswers.q1_intent) }         : {}),
    ...(quizAnswers.q2_feeling        ? { q2_feeling:        String(quizAnswers.q2_feeling) }        : {}),
    ...(quizAnswers.q3_duration       ? { q3_duration:       String(quizAnswers.q3_duration) }       : {}),
    ...(quizAnswers.q4_approach       ? { q4_approach:       String(quizAnswers.q4_approach) }       : {}),
    ...(quizAnswers.q5_communication  ? { q5_communication:  String(quizAnswers.q5_communication) }  : {}),
    ...(quizAnswers.q6_closeness      ? { q6_closeness:      String(quizAnswers.q6_closeness) }      : {}),
    ...(quizAnswers.q7_conflict       ? { q7_conflict:       String(quizAnswers.q7_conflict) }       : {}),
    ...(quizAnswers.q8_intimacy       ? { q8_intimacy:       String(quizAnswers.q8_intimacy) }       : {}),
    ...(quizAnswers.q9_value          ? { q9_value:          String(quizAnswers.q9_value) }          : {}),
    ...(quizAnswers.q14_descriptor    ? { q14_descriptor:    String(quizAnswers.q14_descriptor) }    : {}),
    ...(quizAnswers.q15_chapter       ? { q15_chapter:       String(quizAnswers.q15_chapter) }       : {}),
    ...(quizAnswers.q16_season        ? { q16_season:        String(quizAnswers.q16_season) }        : {}),
    ...(quizAnswers.q17_pattern       ? { q17_pattern:       String(quizAnswers.q17_pattern) }       : {}),
    ...(quizAnswers.q18_trust_texture ? { q18_trust_texture: String(quizAnswers.q18_trust_texture) } : {}),
    ...(quizAnswers.q19_curiosity     ? { q19_curiosity:     String(quizAnswers.q19_curiosity) }     : {}),
    ...(quizAnswers.q23_time_of_day   ? { q23_time_of_day:   String(quizAnswers.q23_time_of_day) }   : {}),
    ...(quizAnswers.q24_helpfulness   ? { q24_helpfulness:   String(quizAnswers.q24_helpfulness) }   : {}),
    ...(quizAnswers.q25_agency        ? { q25_agency:        String(quizAnswers.q25_agency) }        : {}),

    // ── Coordinates (for ascendant computation post-payment) ──
    ...(cityLat        != null ? { cityLat:        String(cityLat) }        : {}),
    ...(cityLng        != null ? { cityLng:        String(cityLng) }        : {}),
    ...(partnerCityLat != null ? { partnerCityLat: String(partnerCityLat) } : {}),
    ...(partnerCityLng != null ? { partnerCityLng: String(partnerCityLng) } : {}),
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
          name: 'OMENORA Compatibility Reading',
          description: 'Destiny Compatibility Analysis',
        },
        unit_amount: TIER_PRICES['single'],
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
      console.error('[create-compatibility-payment] Invalid Stripe price configuration')
      throw createError({ statusCode: 503, message: 'Payment product not configured. Please contact support.' })
    }
    if (status >= 500 || err?.type === 'StripeConnectionError' || err?.type === 'StripeAPIError') throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable — please try again.' })
    console.error('[create-compatibility-payment] Stripe error:', { code, status, message: err?.message })
    throw createError({ statusCode: 500, message: 'Failed to create payment session.' })
  }

  return { sessionId: session.id, url: session.url }
})
