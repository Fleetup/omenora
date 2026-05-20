/**
 * POST /api/founding/create-checkout
 *
 * Creates a Stripe Checkout Session for the $20 OMENORA Founding Member
 * one-time purchase. No authentication required — guest checkout only.
 *
 * On success:
 *   1. Creates a Stripe Checkout Session (payment mode, card only).
 *   2. Inserts a pending row into public.founding_members keyed by session id.
 *   3. Returns { url, sessionId } to the caller for redirect.
 *
 * If the DB insert fails after the Stripe session is created, the session is
 * expired via the Stripe API and a 500 is returned — no orphaned payable
 * sessions are left in the wild.
 *
 * Webhook discriminator: session.metadata.type === 'founding_member'
 * This value is the canonical identifier for Task 3 webhook branching.
 */

import Stripe from 'stripe'

// ── Attribution field length caps ─────────────────────────────────────────────
// These mirror Stripe metadata value limits (500 chars) with comfortable margin.
const UTM_MAX    = 200
const URL_MAX    = 500
const STRING_MAX = 200

// ── Origin resolution ──────────────────────────────────────────────────────────
// Derive base URL from request headers (never from the client-supplied body).
// Precedence: Origin header → x-forwarded-proto + x-forwarded-host (Railway) →
// NUXT_PUBLIC_SITE_URL env fallback.
function resolveBase(event: Parameters<typeof defineEventHandler>[0] extends (e: infer E) => any ? E : never): string {
  // 1. Standard Origin header — already validated by the security middleware
  //    (01.security.ts rejects cross-origin API calls, so if Origin is present
  //    and we got this far, it is on the allow-list).
  const originHeader = getHeader(event, 'origin')
  if (originHeader) {
    try {
      return new URL(originHeader).origin
    } catch { /* fall through */ }
  }

  // 2. Railway reverse-proxy forwarding headers
  const proto = getHeader(event, 'x-forwarded-proto')
  const host  = getHeader(event, 'x-forwarded-host') ?? getHeader(event, 'host')
  if (proto && host) {
    try {
      return new URL(`${proto}://${host}`).origin
    } catch { /* fall through */ }
  }

  // 3. Static fallback from env / runtimeConfig public.siteUrl
  return 'https://omenora.com'
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Guard: price ID must be configured ────────────────────────────────────
  const priceId = config.stripeFoundingPriceId as string
  if (!priceId) {
    console.error('[founding-checkout] NUXT_STRIPE_FOUNDING_PRICE_ID is not set')
    throw createError({ statusCode: 503, message: 'Founding membership is not currently available.' })
  }

  // ── Read + validate body ───────────────────────────────────────────────────
  // Body is entirely optional — attribution context only.
  let rawBody: unknown
  try {
    rawBody = await readBody(event)
  } catch {
    rawBody = null
  }

  // Reject a body that is present but not an object (e.g. a bare string/array).
  if (rawBody !== null && rawBody !== undefined && (typeof rawBody !== 'object' || Array.isArray(rawBody))) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Request body must be a JSON object.' })
  }

  const body = (rawBody ?? {}) as Record<string, unknown>

  // ── Sanitize attribution fields ────────────────────────────────────────────
  const utmSource   = sanitizeString(body.utm_source,   UTM_MAX)
  const utmMedium   = sanitizeString(body.utm_medium,   UTM_MAX)
  const utmCampaign = sanitizeString(body.utm_campaign, UTM_MAX)
  const utmContent  = sanitizeString(body.utm_content,  UTM_MAX)
  const utmTerm     = sanitizeString(body.utm_term,     UTM_MAX)
  const referrer    = sanitizeString(body.referrer,     URL_MAX)
  const landingPage = sanitizeString(body.landing_page, URL_MAX)

  // ── Stripe SDK ─────────────────────────────────────────────────────────────
  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2026-03-25.dahlia',
  })

  // ── Resolve base URL for success/cancel links ──────────────────────────────
  const base = resolveBase(event)

  // ── Build session metadata ─────────────────────────────────────────────────
  // type: 'founding_member' is the canonical discriminator for Task 3 webhook.
  // Empty strings are omitted so we stay well within Stripe's 50-key limit.
  const sessionMeta: Record<string, string> = {
    type: 'founding_member',
    ...(utmSource   ? { utm_source:   utmSource }   : {}),
    ...(utmMedium   ? { utm_medium:   utmMedium }   : {}),
    ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    ...(utmContent  ? { utm_content:  utmContent }  : {}),
    ...(utmTerm     ? { utm_term:     utmTerm }     : {}),
    ...(referrer    ? { referrer:     referrer }     : {}),
    ...(landingPage ? { landing_page: landingPage }  : {}),
  }

  // ── Create Stripe Checkout Session ─────────────────────────────────────────
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],

      // Guest checkout — Stripe collects email. Customer object created so we
      // have a stripe_customer_id for future paid-tier linking.
      customer_creation: 'always',

      // Promotion codes disabled for founding launch.
      allow_promotion_codes: false,

      // Billing address collected at Stripe default level.
      billing_address_collection: 'auto',

      // Success: carry session id to thank-you page (Task 4).
      success_url: `${base}/founding/thank-you?session_id={CHECKOUT_SESSION_ID}`,

      // Cancel: return to founding page with flag for UX feedback.
      cancel_url: `${base}/founding?cancelled=1`,

      // Terms + Refund Policy acceptance displayed at checkout.
      custom_text: {
        terms_of_service_acceptance: {
          message: `By completing this purchase you agree to OMENORA's [Terms of Service](${base}/terms) and [Refund Policy](${base}/refund-policy).`,
        },
      },
      consent_collection: {
        terms_of_service: 'required',
      },

      // PaymentIntent data: description surfaces on the dashboard and
      // card statement where supported. Metadata duplicated here because
      // charge.refunded and charge.dispute.created events arrive with
      // PaymentIntent context only — no session reference.
      payment_intent_data: {
        description: 'OMENORA Founding Member — Lifetime 50% Discount',
        metadata: sessionMeta,
      },

      // Session-level metadata for checkout.session.completed webhook routing.
      metadata: sessionMeta,
    })
  } catch (err: any) {
    const code   = err?.code as string | undefined
    const status = err?.statusCode ?? err?.status ?? 0

    if (code === 'rate_limit') {
      throw createError({ statusCode: 429, message: 'Payment service busy — please try again in a moment.' })
    }
    if (status === 401 || status === 403 || code === 'authentication_required') {
      console.error('[founding-checkout] Stripe auth error:', err?.message)
      throw createError({ statusCode: 502, message: 'Payment service temporarily unavailable.' })
    }
    if (code === 'resource_missing') {
      console.error('[founding-checkout] Invalid Stripe price ID:', priceId)
      throw createError({ statusCode: 502, message: 'Founding membership product not configured. Please contact support.' })
    }
    if (status >= 500 || err?.type === 'StripeConnectionError' || err?.type === 'StripeAPIError') {
      console.error('[founding-checkout] Stripe API/connection error:', { code, status, message: err?.message })
      throw createError({ statusCode: 502, message: 'Payment service temporarily unavailable — please try again.' })
    }

    console.error('[founding-checkout] Unexpected Stripe error:', { code, status, message: err?.message, stack: err?.stack })
    throw createError({ statusCode: 502, message: 'Failed to create checkout session.' })
  }

  // ── Insert pending row in founding_members ─────────────────────────────────
  // amount_cents and currency come from the Stripe session's amount_total.
  // price_1TYuFlDebD8pElyX90pX4jbc is $20.00 USD → 2000 cents. We read the
  // value from the session object so the DB row is always accurate regardless
  // of any future price changes.
  const amountCents = session.amount_total ?? 2000
  const currency    = session.currency    ?? 'usd'

  const supabase = createSupabaseAdmin()
  const { error: dbError } = await supabase
    .from('founding_members')
    .insert({
      stripe_checkout_session_id: session.id,
      amount_cents:               amountCents,
      currency,
      status:                     'pending',
      utm_source:                 utmSource   || null,
      utm_medium:                 utmMedium   || null,
      utm_campaign:               utmCampaign || null,
      utm_content:                utmContent  || null,
      utm_term:                   utmTerm     || null,
      referrer:                   referrer    || null,
      landing_page:               landingPage || null,
      metadata: {
        created_at_iso: new Date().toISOString(),
        resolved_origin: base,
      },
    })

  if (dbError) {
    // DB insert failed — expire the Stripe session so no orphaned payable
    // session is left without a tracking row. Best-effort: log any expiry
    // error but still return 500 to caller.
    console.error('[founding-checkout] founding_members insert failed — expiring Stripe session:', {
      session_id: session.id,
      db_error_code: dbError.code,
      db_error_message: dbError.message,
    })
    try {
      await stripe.checkout.sessions.expire(session.id)
    } catch (expireErr: any) {
      console.error('[founding-checkout] Failed to expire Stripe session after DB failure:', {
        session_id: session.id,
        expire_error: expireErr?.message,
      })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'FOUNDING_DB_INSERT_FAILED' })
  }

  // ── Success ────────────────────────────────────────────────────────────────
  console.info('[founding-checkout] Session created:', {
    session_id:   session.id,
    amount_cents: amountCents,
    utm_source:   utmSource || null,
  })

  return {
    url:       session.url,
    sessionId: session.id,
  }
})
