/**
 * POST /api/create-portal-session
 *
 * Generates a Stripe Customer Portal session URL for an active subscriber.
 * The returned URL is pre-authenticated — the user lands directly in their
 * subscription management page with zero friction.
 *
 * FTC "Click to Cancel" compliance: the portal exposes a cancel button that
 * meets the one-click cancellation requirement.
 *
 * Input:  { email: string }
 * Output: { url: string }
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const email = sanitizeString(body.email ?? '', 254)

  assertInput(isValidEmail(email), 'Valid email is required')

  // ── Look up active subscriber ─────────────────────────────────────────────
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: subscriber, error: dbErr } = await supabase
    .from('subscribers')
    .select('stripe_customer_id')
    .eq('email', email)
    .eq('active', true)
    .maybeSingle()

  if (dbErr) {
    console.error('[create-portal-session] DB error:', dbErr.code, dbErr.message)
    throw createError({ statusCode: 500, message: 'Failed to look up subscription' })
  }

  if (!subscriber?.stripe_customer_id) {
    throw createError({ statusCode: 400, message: 'No active subscription found for this email' })
  }

  // ── Create Stripe Customer Portal session ────────────────────────────────
  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  let session: Stripe.BillingPortal.Session
  try {
    session = await stripe.billingPortal.sessions.create({
      customer: subscriber.stripe_customer_id,
      return_url: 'https://omenora.com/account',
    })
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status ?? 0
    if (status === 401 || status === 403) {
      throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable.' })
    }
    if (status >= 500 || err?.type === 'StripeConnectionError' || err?.type === 'StripeAPIError') {
      throw createError({ statusCode: 503, message: 'Payment service temporarily unavailable — please try again.' })
    }
    console.error('[create-portal-session] Stripe error:', err?.message)
    throw createError({ statusCode: 500, message: 'Failed to create portal session.' })
  }

  return { url: session.url }
})
