/**
 * POST /api/notifications/register
 *
 * Registers a device push notification token for the authenticated user.
 * Uses upsert so re-registering the same token is idempotent.
 *
 * Body: { token: string, platform: 'ios' | 'android' }
 */

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event)
  const { token, platform } = body ?? {}

  if (!token || typeof token !== 'string' || token.trim() === '') {
    throw createError({ statusCode: 400, message: 'token is required and must be a non-empty string.' })
  }

  if (platform !== 'ios' && platform !== 'android') {
    throw createError({ statusCode: 400, message: "platform must be 'ios' or 'android'." })
  }

  const supabaseAdmin = createSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('push_tokens')
    .upsert(
      { user_id: user.id, token, platform, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,token' },
    )

  if (error) {
    console.error('[notifications/register] upsert failed:', error.message)
    throw createError({ statusCode: 500, message: 'Failed to register push token.' })
  }

  return { success: true }
})
