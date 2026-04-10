/**
 * Server-side authentication utilities.
 * Auto-imported by Nitro in all server/api and server/middleware files.
 */
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

/**
 * Create a Supabase admin client (service role key).
 * Used server-side only — never expose the service key to the client.
 */
export function createSupabaseAdmin() {
  const config = useRuntimeConfig()
  return createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

/**
 * Extract and validate the Bearer token from the Authorization header.
 * Verifies the JWT against Supabase and returns the authenticated user.
 * Throws HTTP 401 if the token is missing, invalid, or expired.
 */
export async function requireAuth(event: Parameters<typeof defineEventHandler>[0] extends (e: infer E) => any ? E : never): Promise<User> {
  const authHeader = getHeader(event, 'authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }

  const supabase = createSupabaseAdmin()

  // getUser validates the JWT against Supabase — not a local verify
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    throw createError({ statusCode: 401, message: 'Invalid or expired session' })
  }

  return data.user
}
