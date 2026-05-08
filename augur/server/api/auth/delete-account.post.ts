/**
 * Account deletion endpoint.
 *
 * Requires authenticated request (JWT in Authorization header).
 * Verifies the JWT belongs to the user being deleted, then calls
 * supabase.auth.admin.deleteUser() which cascades to public.users
 * (FK ON DELETE CASCADE) and removes all user data.
 *
 * This is an Apple HIG App Store submission requirement.
 *
 * Security: The userId is derived from the JWT, NEVER from request body.
 * This prevents one user from deleting another user's account.
 */

export default defineEventHandler(async (event) => {
  // Verify JWT and extract user — throws 401 if missing or invalid
  const user = await requireAuth(event)

  // Delete the user via admin API.
  // This cascades to public.users via FK ON DELETE CASCADE,
  // removing all user-owned data automatically.
  const supabaseAdmin = createSupabaseAdmin()
  const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (deleteErr) {
    console.error('[delete-account] deleteUser failed:', deleteErr.message)
    throw createError({
      statusCode: 500,
      message: 'Account deletion failed. Please contact support@omenora.com.',
    })
  }

  console.log('[delete-account] deleted user:', user.id)

  return { success: true }
})
