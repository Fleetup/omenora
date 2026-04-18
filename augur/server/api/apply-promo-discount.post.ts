import Stripe from 'stripe'

const TIER_BASE_PRICES: Record<string, { cents: number; name: string }> = {
  basic:  { cents: 299,  name: 'OMENORA Destiny Report — Basic' },
  bundle: { cents: 499,  name: 'OMENORA Destiny Report + Bundle' },
  oracle: { cents: 1299, name: 'OMENORA Full Oracle Bundle' },
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const codeId    = sanitizeString(body.codeId, 100)
  const rawCode   = sanitizeString(body.code, 50).toUpperCase()
  const email     = sanitizeString(body.email, 254)
  const tier      = sanitizeString(body.tier, 20).toLowerCase() as 'basic' | 'bundle' | 'oracle'
  const firstName = sanitizeString(body.firstName, 50)
  const archetype = sanitizeString(body.archetype, 30)
  const tempId    = sanitizeString(body.tempId, 100)
  const region    = isValidRegion(body.region) ? body.region : 'western'
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const lifePathNumber = sanitizeString(String(body.lifePathNumber ?? ''), 5)
  const timeOfBirth    = sanitizeString(body.timeOfBirth ?? '', 10)
  const language       = sanitizeString(body.language || 'en', 5)
  const originRaw      = sanitizeString(body.origin, 300)

  assertInput(codeId.length > 0, 'codeId is required')
  assertInput(rawCode.length > 0, 'code is required')
  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(tier in TIER_BASE_PRICES, 'Invalid tier')
  assertInput(isValidArchetype(archetype), 'Invalid archetype')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  const supabase = createSupabaseAdmin()

  // ── Re-validate code from scratch ─────────────────────────────────────────
  let codeRecord: any
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', codeId)
      .eq('code', rawCode)
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    codeRecord = data
  } catch (err: any) {
    console.error('[apply-promo-discount] Code lookup error:', err?.message)
    throw createError({ statusCode: 500, message: 'Unable to validate code. Please try again.' })
  }

  if (!codeRecord) throw createError({ statusCode: 400, message: 'This code is not valid' })
  if (!codeRecord.active) throw createError({ statusCode: 400, message: 'This code is no longer active' })
  if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
    throw createError({ statusCode: 400, message: 'This code has expired' })
  }
  if (codeRecord.current_uses >= codeRecord.max_uses) {
    throw createError({ statusCode: 400, message: 'This code has reached its usage limit' })
  }
  if (codeRecord.code_type !== 'discount_percent') {
    throw createError({ statusCode: 400, message: 'This code is not a discount code' })
  }

  // ── Calculate discounted amount ────────────────────────────────────────────
  const tierInfo = TIER_BASE_PRICES[tier]!
  const discountValue = codeRecord.discount_value ?? 0
  const discountedCents = Math.max(1, Math.round(tierInfo.cents * (1 - discountValue / 100)))

  // ── Create Stripe checkout session with price_data ─────────────────────────
  const base = safeOrigin(originRaw)

  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  const isBundleOrOracle = tier === 'bundle' || tier === 'oracle'
  const successUrl = tier === 'oracle'
    ? `${base}/report?session_id={CHECKOUT_SESSION_ID}&oracle=true`
    : isBundleOrOracle
      ? `${base}/report?session_id={CHECKOUT_SESSION_ID}&bundle=true`
      : `${base}/report?session_id={CHECKOUT_SESSION_ID}`

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${tierInfo.name} (${discountValue}% off)`,
          description: `Promo code ${rawCode} applied — ${discountValue}% discount`,
        },
        unit_amount: discountedCents,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: successUrl,
    cancel_url:  `${base}/preview`,
    customer_email: isValidEmail(email) ? email : undefined,
    metadata: {
      firstName,
      archetype,
      email:           isValidEmail(email) ? email : '',
      tempId,
      region,
      dateOfBirth,
      lifePathNumber,
      timeOfBirth,
      language,
      type:            tier,
      bundle:          isBundleOrOracle ? 'true' : 'false',
      oracle:          tier === 'oracle' ? 'true' : 'false',
      promo_code:      rawCode,
      code_id:         codeId,
      discount_applied: String(discountValue),
      original_tier:   tier,
    },
  })

  return { sessionId: session.id, url: session.url }
})
