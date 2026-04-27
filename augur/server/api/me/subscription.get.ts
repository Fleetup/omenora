/**
 * GET /api/me/subscription
 *
 * Returns the active subscription status for the authenticated user.
 * Requires a valid Supabase Bearer token in the Authorization header.
 *
 * Output: { active: boolean, stripeSubscriptionId: string | null, email: string,
 *           planName: string | null, planPrice: string | null, planType: string | null }
 */
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Validate JWT — throws 401 if missing or invalid
  const user = await requireAuth(event)

  if (!user.email) {
    throw createError({ statusCode: 401, message: 'Authenticated user has no email' })
  }

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: rows, error } = await supabase
    .from('subscribers')
    .select('stripe_subscription_id, active, plan_type')
    .eq('email', user.email)
    .eq('active', true)
    .limit(5)

  if (error) {
    console.error('[me/subscription] Fetch error:', error.code, error.message)
    throw createError({ statusCode: 500, message: 'Failed to load subscription status' })
  }

  if (!rows || rows.length === 0) {
    return {
      active: false,
      stripeSubscriptionId: null,
      email: user.email,
      planName: null,
      planPrice: null,
      planType: null,
    }
  }

  // When the user has multiple active rows (e.g. bought both plans with the
  // same email), surface the highest tier so they see the correct plan.
  // Tier order: compatibility_plus > daily_horoscope
  const subscriber = rows.find(r => r.plan_type === 'compatibility_plus') ?? rows[0]!

  const planName = subscriber.plan_type === 'compatibility_plus'
    ? 'Compatibility Plus'
    : 'Personal Daily Horoscope'

  const planPrice = subscriber.plan_type === 'compatibility_plus'
    ? '$9.99'
    : '$4.99'

  return {
    active: true,
    stripeSubscriptionId: subscriber.stripe_subscription_id as string | null,
    email: user.email,
    planName,
    planPrice,
    planType: subscriber.plan_type as string | null,
  }
})
