/**
 * useAuth — Supabase Auth composable for the Omenora web app.
 *
 * Handles:
 *  - Provisioning an account after payment (web: sessionId, mobile: paymentIntentId)
 *  - Exchanging the one-time tokenHash for a live Supabase session
 *  - Persisting / restoring the session across page reloads
 *  - Fetching the authenticated user's reports
 *  - Sign-out
 *
 * The underlying Supabase JS client automatically persists the session in
 * localStorage on web. On mobile, use expo-secure-store for the same purpose
 * by passing a custom storage adapter when initialising the Supabase client.
 */
import { getSupabaseClient } from '~/utils/supabase'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  // Shared reactive session state across all composable usages on the same page
  const session = useState<Session | null>('omenora-auth-session', () => null)
  const isProvisioning = useState<boolean>('omenora-auth-provisioning', () => false)

  const supabase = getSupabaseClient()

  // ── Provision + sign in after payment ──────────────────────────────────────

  /**
   * Call this after a successful Stripe payment.
   *
   * Web:   provisionUser({ sessionId: 'cs_live_...' })
   * Mobile: provisionUser({ paymentIntentId: 'pi_live_...' })
   *
   * Non-throwing — provisioning failure is silently ignored so it never
   * blocks the report page from rendering.
   */
  async function provisionUser(params: {
    sessionId?: string
    paymentIntentId?: string
  }): Promise<boolean> {
    if (!params.sessionId && !params.paymentIntentId) return false
    if (isProvisioning.value) return false

    isProvisioning.value = true

    try {
      // Ask the backend to create/retrieve the Supabase Auth account.
      // Email is always sourced from Stripe — the backend ignores any email in the body.
      const { tokenHash } = await $fetch<{ tokenHash: string; email: string }>(
        '/api/auth/provision-user',
        {
          method: 'POST',
          body: params,
        },
      )

      // Exchange the one-time token for a live Supabase session.
      // Supabase JS stores this in localStorage automatically.
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email',
      })

      if (error || !data.session) return false

      session.value = data.session
      return true
    } catch {
      // Auth provisioning is non-critical — report renders fine without it
      return false
    } finally {
      isProvisioning.value = false
    }
  }

  // ── Restore session on page load ───────────────────────────────────────────

  /**
   * Check if a Supabase session exists in localStorage (web) or was injected
   * (mobile). Call this in onMounted of any page that should respect auth state.
   */
  async function restoreSession(): Promise<boolean> {
    // After a magic-link click, Supabase redirects to our page with either:
    //   a) a URL hash fragment: #access_token=...&type=magiclink  (implicit flow)
    //   b) query params:        ?code=...                          (PKCE flow)
    // Supabase JS v2 detects both automatically via onAuthStateChange, but the
    // event fires asynchronously AFTER the first getSession() call returns null.
    // We must wait for SIGNED_IN if we detect an auth callback in the URL.
    const isAuthCallback = import.meta.client && (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('type=magiclink') ||
      new URLSearchParams(window.location.search).has('code')
    )

    if (isAuthCallback) {
      // Wait up to 5 seconds for Supabase to exchange the token and fire SIGNED_IN
      const resolved = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), 5000)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
          if (event === 'SIGNED_IN' && s) {
            clearTimeout(timer)
            subscription.unsubscribe()
            session.value = s
            resolve(true)
          }
        })
      })
      if (resolved) return true
    }

    // Standard path: read persisted session from localStorage
    // getSession() reads from localStorage without a network call — it cannot
    // detect revoked tokens. We use it only to check if a local token exists,
    // then call getUser() which validates the JWT against the Supabase server.
    const { data: localData } = await supabase.auth.getSession()
    if (!localData.session) return false

    const { data: userData, error } = await supabase.auth.getUser(
      localData.session.access_token,
    )

    if (error || !userData.user) {
      // Token is invalid or revoked — clear local session
      await supabase.auth.signOut()
      session.value = null
      return false
    }

    session.value = localData.session
    return true
  }

  // ── Protected API calls ────────────────────────────────────────────────────

  /**
   * Fetch all reports for the currently authenticated user.
   * Returns an empty array if the user is not signed in.
   */
  async function getMyReports() {
    const token = session.value?.access_token
    if (!token) return []

    try {
      const data = await $fetch<{ reports: unknown[] }>('/api/me/reports', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return data.reports
    } catch {
      return []
    }
  }

  // ── Sign out ───────────────────────────────────────────────────────────────

  async function signOut() {
    await supabase.auth.signOut()
    session.value = null
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!session.value)
  const userEmail = computed(() => session.value?.user?.email ?? null)

  return {
    session: readonly(session),
    isAuthenticated,
    isProvisioning: readonly(isProvisioning),
    userEmail,
    provisionUser,
    restoreSession,
    getMyReports,
    signOut,
  }
}
