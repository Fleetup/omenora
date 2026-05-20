// credits.ts — helper module for the credit-balance system.
// Wraps three SECURITY DEFINER Postgres RPC functions defined in
// supabase/migrations/20260514120200_credit_rpc_functions.sql:
//   - grant_credits     → grantCredits()
//   - clawback_credits  → clawbackCredits()
//   - consume_credit    → consumeCredit()
// Plus one direct table read:
//   - getCreditBalance() reads from user_credits via service role
//
// All four functions resolve to integer (new balance) on success.
// All four require service-role access (anon/authenticated cannot call RPCs).
import { createSupabaseAdmin } from './auth'

export type CreditType = 'counsel' | 'compat'

/**
 * Read the current credit balance for a user.
 * Returns 0 if no row exists (defensive — backfill migration should ensure a row exists).
 */
export async function getCreditBalance(
  userId: string,
  creditType: CreditType,
): Promise<number> {
  const supabaseAdmin = createSupabaseAdmin()
  const column = creditType === 'counsel' ? 'counsel_credits' : 'compat_credits'

  const { data, error } = await supabaseAdmin
    .from('user_credits')
    .select(column)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[credits] getCreditBalance failed:', error.message, { userId, creditType })
    throw createError({ statusCode: 500, message: 'Failed to read credit balance' })
  }

  if (!data) return 0

  return (data as Record<string, number>)[column] ?? 0
}

/**
 * Atomically decrement a user's credit balance by 1.
 * Returns the new balance.
 *
 * NOTE: This function does NOT verify positive balance before consuming.
 * The CHECK constraint on user_credits.{counsel|compat}_credits >= 0 prevents
 * negative balance at the DB level by raising. Callers must check
 * getCreditBalance() before calling consumeCredit() to provide a clean error
 * response. This mirrors the existing requirePremiumWithUsage → incrementUsage
 * pattern in entitlements.ts.
 */
export async function consumeCredit(
  userId: string,
  creditType: CreditType,
): Promise<number> {
  const supabaseAdmin = createSupabaseAdmin()
  const { data, error } = await supabaseAdmin.rpc('consume_credit', {
    p_user_id: userId,
    p_credit_type: creditType,
  })

  if (error) {
    console.error('[credits] consumeCredit failed:', error.message, { userId, creditType })
    throw createError({ statusCode: 500, message: 'Failed to consume credit' })
  }

  return data as number
}

/**
 * Idempotently grant credits on a RevenueCat NON_RENEWING_PURCHASE webhook.
 * Returns the new balance.
 *
 * Idempotency: if rcEventId has already been processed, the RPC returns the
 * current balance unchanged and does NOT throw. Callers should treat a
 * duplicate event as success.
 */
export async function grantCredits(
  userId: string,
  creditType: CreditType,
  delta: number,
  rcEventId: string,
  productId: string,
): Promise<number> {
  const supabaseAdmin = createSupabaseAdmin()
  const { data, error } = await supabaseAdmin.rpc('grant_credits', {
    p_user_id: userId,
    p_credit_type: creditType,
    p_delta: delta,
    p_rc_event_id: rcEventId,
    p_product_id: productId,
  })

  if (error) {
    console.error('[credits] grantCredits failed:', error.message, { userId, creditType, delta, rcEventId })
    throw createError({ statusCode: 500, message: 'Failed to grant credits' })
  }

  return data as number
}

/**
 * Idempotently subtract credits on a RevenueCat refund/cancellation webhook.
 * Balance is floored at 0 by the RPC — never produces a negative balance.
 * Returns the new balance.
 *
 * Idempotency: if rcEventId has already been processed, the RPC returns the
 * current balance unchanged and does NOT throw. Callers should treat a
 * duplicate event as success.
 */
export async function clawbackCredits(
  userId: string,
  creditType: CreditType,
  delta: number,
  rcEventId: string,
  productId: string,
): Promise<number> {
  const supabaseAdmin = createSupabaseAdmin()
  const { data, error } = await supabaseAdmin.rpc('clawback_credits', {
    p_user_id: userId,
    p_credit_type: creditType,
    p_delta: delta,
    p_rc_event_id: rcEventId,
    p_product_id: productId,
  })

  if (error) {
    console.error('[credits] clawbackCredits failed:', error.message, { userId, creditType, delta, rcEventId })
    throw createError({ statusCode: 500, message: 'Failed to clawback credits' })
  }

  return data as number
}
