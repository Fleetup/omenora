import { createClient } from '@supabase/supabase-js'

const SUPABASE_CLIENT_KEY = '__omenora_supabase_client__'

/**
 * Returns a Supabase anon client scoped to the current Nuxt app instance.
 *
 * Using useNuxtApp() as the scope means:
 *   - Browser: the app instance lives for the lifetime of the tab → one client
 *     per tab (same as the old module singleton, but lifecycle is explicit).
 *   - SSR: each server request gets its own app instance → no cross-request
 *     auth state bleed between concurrent users.
 *
 * Never use this on the server for privileged operations — use
 * createSupabaseAdmin() (server/utils/auth.ts) for service-role access.
 */
export function getSupabaseClient() {
  const nuxtApp = useNuxtApp()

  if (!nuxtApp[SUPABASE_CLIENT_KEY]) {
    const config = useRuntimeConfig()
    nuxtApp[SUPABASE_CLIENT_KEY] = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string,
      { auth: { persistSession: import.meta.client } },
    )
  }

  return nuxtApp[SUPABASE_CLIENT_KEY] as ReturnType<typeof createClient>
}
