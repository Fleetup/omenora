import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config  = useRuntimeConfig()
  const body    = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const email          = sanitizeString(body.email, 254)
  const reportId       = sanitizeString(body.reportId, 200)
  const newTradition   = isValidRegion(body.newTradition) ? (body.newTradition as string) : null
  const archetype      = sanitizeString(body.archetype, 30)
  const lifePathNumber = sanitizeString(String(body.lifePathNumber ?? ''), 5)
  const language       = sanitizeString(body.language || 'en', 5)
  const originRaw      = sanitizeString(body.origin, 300)

  assertInput(!!firstName, 'firstName is required')
  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(isValidReportId(reportId), 'Invalid reportId')
  assertInput(newTradition !== null, 'newTradition must be a valid region')
  assertInput(newTradition !== 'western', 'Western is already the default tradition')
  assertInput(isValidArchetype(archetype), 'Invalid archetype')
  assertInput(isValidRedirectOrigin(originRaw), 'Invalid origin')

  const base = safeOrigin(originRaw)

  const TRADITION_NAMES: Record<string, string> = {
    india:     'Vedic (Jyotish)',
    china:     'BaZi (Four Pillars)',
    latam:     'Spiritual Tarot',
    korea:     'Personality Insight',
    middleeast:'Destiny Path',
  }
  const traditionLabel = TRADITION_NAMES[newTradition] ?? newTradition

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `OMENORA ${traditionLabel} Reading`,
          description: `Full destiny report re-generated through the ${traditionLabel} tradition`,
        },
        unit_amount: 199,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${base}/report?session_id={CHECKOUT_SESSION_ID}&tradition_switch=true`,
    cancel_url:  `${base}/report`,
    customer_email: isValidEmail(email) ? email : undefined,
    metadata: {
      firstName,
      email: isValidEmail(email) ? email : '',
      reportId,
      newTradition,
      archetype,
      lifePathNumber,
      language,
      type: 'tradition_switch',
    },
  })

  return { sessionId: session.id, url: session.url }
})
