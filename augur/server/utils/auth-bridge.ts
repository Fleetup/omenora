// auth-bridge.ts — resolves a Stripe customer email to a Supabase auth.users UUID.
// Called by the Stripe webhook on checkout.session.completed to bridge the
// Stripe identity model (email + stripe_customer_id) with the Supabase
// entitlement model (auth.users UUID → subscriptions table).
import { createSupabaseAdmin } from './auth'

/**
 * Resolve a Stripe customer email to a Supabase auth.users UUID.
 * If no matching user exists, creates one (email confirmed, no password).
 *
 * Called from the Stripe webhook on checkout.session.completed immediately
 * before writing a row to public.subscriptions (which requires auth.users(id)
 * as the user_id foreign key).
 *
 * Returns { userId, isNew } where:
 *   - userId: the auth.users.id UUID (existing or newly created)
 *   - isNew: true if the user was created in this call, false if found
 *
 * Throws:
 *   400 if email is empty or malformed
 *   500 if the Supabase admin API returns an unexpected error
 */
export async function findOrCreateAuthUserByEmail(
  email: string,
): Promise<{ userId: string; isNew: boolean }> {
  if (!isValidEmail(email)) {
    throw createError({ statusCode: 400, message: 'Invalid email' })
  }

  const supabaseAdmin = createSupabaseAdmin()
  const normalizedEmail = email.toLowerCase().trim()

  // Attempt to create the user first.
  // If they already exist, Supabase returns an "already registered" error —
  // we catch that and fall through to the lookup path.
  // This mirrors the pattern in server/api/auth/provision-user.post.ts.
  const { data: createData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: { source: 'stripe_webhook' },
  })

  if (!createErr) {
    // Fresh user created — return immediately
    return { userId: createData.user.id, isNew: true }
  }

  const errMsg = createErr.message?.toLowerCase() ?? ''

  if (!errMsg.includes('already') && !errMsg.includes('exists')) {
    // Unexpected error — not a duplicate; surface it
    console.error('[auth-bridge] createUser failed unexpectedly:', createErr.message, { email: normalizedEmail })
    throw createError({ statusCode: 500, message: 'Failed to provision auth user' })
  }

  // User already exists — find them by email via paginated listUsers.
  // SDK v2.102 does not support email filter on listUsers; iterate pages.
  let page = 1
  const perPage = 1000

  while (true) {
    const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })

    if (listErr) {
      console.error('[auth-bridge] listUsers failed:', listErr.message, { email: normalizedEmail, page })
      throw createError({ statusCode: 500, message: 'Failed to look up auth user' })
    }

    const found = listData.users.find(
      (u) => u.email?.toLowerCase() === normalizedEmail,
    )

    if (found) {
      return { userId: found.id, isNew: false }
    }

    // If this page returned fewer rows than perPage, we have exhausted all users
    if (listData.users.length < perPage) {
      break
    }

    page++
  }

  // Should never reach here: createUser confirmed the user exists but listUsers
  // could not find them. Surface as a 500 so the webhook retries.
  console.error('[auth-bridge] user reported as existing but not found in listUsers', { email: normalizedEmail })
  throw createError({ statusCode: 500, message: 'Auth user lookup inconsistency' })
}
