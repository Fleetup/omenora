/**
 * GET /api/me/subscription
 *
 * Returns the active subscription status for the authenticated user.
 * Requires a valid Supabase Bearer token in the Authorization header.
 *
 * Output: { active: boolean, stripeSubscriptionId: string | null, email: string }
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

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('stripe_subscription_id, active')
    .eq('email', user.email)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    console.error('[me/subscription] Fetch error:', error.code, error.message)
    throw createError({ statusCode: 500, message: 'Failed to load subscription status' })
  }

  if (!subscriber) {
    return {
      active: false,
      stripeSubscriptionId: null,
      email: user.email,
    }
  }

  return {
    active: true,
    stripeSubscriptionId: subscriber.stripe_subscription_id as string | null,
    email: user.email,
  }
})
