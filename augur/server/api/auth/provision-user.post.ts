/**
 * POST /api/auth/provision-user
 *
 * Creates (or retrieves) a Supabase Auth account for a user who has
 * just completed a Stripe payment. Works for both:
 *   - Web app  → send { sessionId }        (Stripe Checkout Session)
 *   - Mobile   → send { paymentIntentId }  (Stripe PaymentIntent)
 *
 * Security model:
 *   - The email is ALWAYS sourced from Stripe's records, never from the
 *     request body. This prevents a caller from hijacking another user's
 *     email address by supplying a valid payment ID + different email.
 *   - Payment must have a confirmed/succeeded status before we provision.
 *   - Returns a one-time tokenHash the client exchanges for a Supabase
 *     session via supabase.auth.verifyOtp(). The token expires in 1 hour.
 */
import Stripe from 'stripe'

const PI_ID_REGEX = /^pi_(live|test)_[A-Za-z0-9_]{10,200}$/

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const sessionId       = sanitizeString(body.sessionId ?? '', 200)
  const paymentIntentId = sanitizeString(body.paymentIntentId ?? '', 100)

  const hasSession = isValidSessionId(sessionId)
  const hasIntent  = PI_ID_REGEX.test(paymentIntentId)

  assertInput(hasSession || hasIntent, 'Provide a valid sessionId or paymentIntentId')

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  // ── Verify payment and extract email from Stripe (never from client body) ─
  let verifiedEmail: string

  if (hasSession) {
    // Web: Stripe Checkout Session
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch {
      throw createError({ statusCode: 404, message: 'Session not found' })
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      throw createError({ statusCode: 403, message: 'Payment not confirmed' })
    }

    verifiedEmail = session.customer_email || session.metadata?.email || ''
  } else {
    // Mobile: Stripe PaymentIntent
    let pi: Stripe.PaymentIntent
    try {
      pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch {
      throw createError({ statusCode: 404, message: 'Payment intent not found' })
    }

    if (pi.status !== 'succeeded') {
      throw createError({ statusCode: 403, message: 'Payment not confirmed' })
    }

    verifiedEmail = pi.receipt_email || pi.metadata?.email || ''
  }

  if (!isValidEmail(verifiedEmail)) {
    throw createError({
      statusCode: 422,
      message: 'No verified email on the payment record. Provide an email at checkout to enable account access.',
    })
  }

  // ── Provision Supabase Auth user ──────────────────────────────────────────
  const supabase = createSupabaseAdmin()

  // createUser is idempotent in intent — if the user already exists Supabase
  // returns an error. We ignore "already registered" and continue to generateLink.
  const { error: provisionErr } = await supabase.auth.admin.createUser({
    email: verifiedEmail,
    email_confirm: true, // skip email verification — Stripe already confirmed it
    user_metadata: { source: 'omenora_payment', platform: hasSession ? 'web' : 'mobile' },
  })

  if (provisionErr) {
    const msg = provisionErr.message?.toLowerCase() ?? ''
    // "already registered" is expected for returning users — ignore it
    if (!msg.includes('already') && !msg.includes('exists')) {
      console.error('Auth provision error:', provisionErr.code)
      throw createError({ statusCode: 500, message: 'Failed to provision account' })
    }
  }

  // ── Generate one-time sign-in token ───────────────────────────────────────
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: verifiedEmail,
  })

  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error('Auth link generation error:', linkErr?.code)
    throw createError({ statusCode: 500, message: 'Failed to generate auth token' })
  }

  return {
    tokenHash: linkData.properties.hashed_token,
    email: verifiedEmail,
  }
})
