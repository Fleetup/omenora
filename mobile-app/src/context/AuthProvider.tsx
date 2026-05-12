import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Alert } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import type { Session } from '@supabase/supabase-js'
import Purchases from 'react-native-purchases'
import { supabase } from '../lib/supabase'
import { useProfileStore } from '../stores/profileStore'
import { fetchProfile, saveProfile } from '../services/profileService'
import { AuthGate } from '../components/organisms/AuthGate'
import { AuthContext, type AuthContextValue } from './AuthContext'

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

// Configure Google Sign-In once at module load.
if (GOOGLE_IOS_CLIENT_ID && GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  })
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authGateState, setAuthGateState] = useState<{
    visible: boolean
    title?: string
    body?: string
  }>({ visible: false })

  const previousAnonymousUserIdRef  = useRef<string | null>(null)
  const signingInAnonymouslyRef     = useRef(false)

  // Bootstrap: subscribe to auth changes, sign in anonymously if no session.
  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (!mounted) return

        if (currentSession) {
          setSession(currentSession)
        } else {
          // No session — create anonymous user.
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) {
            console.error('[Auth] anonymous sign-in failed:', error.message)
          } else if (mounted) {
            setSession(data.session)
          }
        }
      } catch (err) {
        console.error('[Auth] bootstrap error:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    bootstrap()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (mounted) setSession(newSession)

      // Capture anonymous user ID when bootstrap completes
      if (newSession?.user?.is_anonymous) {
        previousAnonymousUserIdRef.current = newSession.user.id
      }

      // On permanent sign-in: transfer anonymous data (first-time) then hydrate profileStore
      if (event === 'SIGNED_IN' && newSession?.user && !newSession.user.is_anonymous) {
        const targetId = newSession.user.id

        // ── Transfer from anonymous session (onboarding path only) ─────────────
        if (
          previousAnonymousUserIdRef.current &&
          previousAnonymousUserIdRef.current !== targetId
        ) {
          const sourceId = previousAnonymousUserIdRef.current
          try {
            const { data, error } = await supabase.rpc('transfer_anonymous_user', {
              source_user_id: sourceId,
              target_user_id: targetId,
            })

            if (error) {
              if (error.message?.includes('source user does not exist')) {
                // Anonymous user cleaned up by Supabase 30-day expiry. Non-fatal.
                console.warn('[Auth] transfer_anonymous_user: source already gone, skipping')
                previousAnonymousUserIdRef.current = null
              } else {
                console.error('[Auth] transfer_anonymous_user failed:', error.message)
              }
            } else {
              console.log('[Auth] transfer succeeded:', data)
              previousAnonymousUserIdRef.current = null

              // Set RC custom attributes
              try {
                const { data: userRow } = await supabase
                  .from('users')
                  .select('first_name, last_name, email')
                  .eq('id', targetId)
                  .single()

                if (userRow) {
                  await Purchases.setAttributes({
                    $email: userRow.email ?? '',
                    $displayName: userRow.first_name
                      ? `${userRow.first_name}${userRow.last_name ? ' ' + userRow.last_name : ''}`.trim()
                      : '',
                  })
                }
              } catch (e) {
                console.warn('[Auth] failed to set RC attributes:', e)
              }
            }
          } catch (err: any) {
            console.error('[Auth] transfer RPC threw:', err?.message)
          }
        }

        // ── Hydrate profileStore from server (all permanent sign-ins) ──────────
        // Handles both: first-time sign-in (profile just transferred) and
        // returning user sign-in on fresh device / after sign-out.
        try {
          const serverProfile = await fetchProfile(targetId)
          if (serverProfile) {
            const store = useProfileStore.getState()
            if (serverProfile.first_name)        store.setFirstName(serverProfile.first_name)
            if (serverProfile.date_of_birth)     store.setDateOfBirth(serverProfile.date_of_birth)
            if (serverProfile.time_of_birth)     store.setTimeOfBirth(serverProfile.time_of_birth)
            if (serverProfile.city)              store.setCity(serverProfile.city)
            if (serverProfile.archetype)         store.setArchetype(serverProfile.archetype)
            store.setSunSign(serverProfile.sun_sign ?? null)
            store.setMoonSign(serverProfile.moon_sign ?? null)
            store.setRisingSign(serverProfile.rising_sign ?? null)
            if (serverProfile.life_path_number != null) {
              store.setLifePathNumber(serverProfile.life_path_number)
            }
            console.log('[Auth] profileStore hydrated from server for user:', targetId)
          } else {
            // No server row yet (user_profiles table is new, or user onboarded before
            // this feature shipped). If local profileStore still has their data from
            // a prior onboarding session, sync it up now so future sign-ins can hydrate.
            const localStore = useProfileStore.getState()
            if (localStore.dateOfBirth) {
              saveProfile(targetId, {
                first_name:       localStore.firstName    || undefined,
                date_of_birth:    localStore.dateOfBirth,
                time_of_birth:    localStore.timeOfBirth  || undefined,
                city:             localStore.city         || undefined,
                archetype:        localStore.archetype    || undefined,
                sun_sign:         localStore.sunSign      || undefined,
                moon_sign:        localStore.moonSign     || undefined,
                rising_sign:      localStore.risingSign   || undefined,
                life_path_number: localStore.lifePathNumber ?? undefined,
              }).catch((e) => console.warn('[Auth] local→server sync-up failed:', e))
              console.log('[Auth] no server profile — synced local profileStore to server for:', targetId)
            }
          }
        } catch (hydrationErr) {
          console.warn('[Auth] profile hydration non-blocking error:', hydrationErr)
        }
      }

      // On sign-out: re-bootstrap a new anonymous session so the app never sits session-less.
      // Guard against re-entrance in case SIGNED_OUT fires before the new SIGNED_IN arrives.
      if (event === 'SIGNED_OUT' && !newSession && mounted && !signingInAnonymouslyRef.current) {
        signingInAnonymouslyRef.current = true
        try {
          const { error } = await supabase.auth.signInAnonymously()
          if (error) {
            console.error('[Auth] re-bootstrap after sign-out failed:', error.message)
            Alert.alert('Session Error', 'Could not create a new session. Please restart the app.')
          }
          // On success, SIGNED_IN fires → listener sets session with the new anonymous user.
        } catch (err: any) {
          console.error('[Auth] re-bootstrap after sign-out threw:', err?.message)
          Alert.alert('Session Error', 'Could not create a new session. Please restart the app.')
        } finally {
          signingInAnonymouslyRef.current = false
        }
      }

      // On sign-out: re-bootstrap a new anonymous session so the app never sits session-less.
      // Guard against re-entrance in case SIGNED_OUT fires before the new SIGNED_IN arrives.
      if (event === 'SIGNED_OUT' && !newSession && mounted && !signingInAnonymouslyRef.current) {
        signingInAnonymouslyRef.current = true
        try {
          const { error } = await supabase.auth.signInAnonymously()
          if (error) {
            console.error('[Auth] re-bootstrap after sign-out failed:', error.message)
            Alert.alert('Session Error', 'Could not create a new session. Please restart the app.')
          }
          // On success, SIGNED_IN fires → listener sets session with the new anonymous user.
        } catch (err: any) {
          console.error('[Auth] re-bootstrap after sign-out threw:', err?.message)
          Alert.alert('Session Error', 'Could not create a new session. Please restart the app.')
        } finally {
          signingInAnonymouslyRef.current = false
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithApple = useCallback(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      // Capture the name BEFORE the Supabase call — Apple only provides fullName
      // on the very first sign-in for a given Apple ID. On all subsequent sign-ins
      // the value is null. This is the only opportunity to capture it.
      const appleGivenName = credential.fullName?.givenName ?? null

      if (!credential.identityToken) {
        throw new Error('Apple Sign In: no identity token returned')
      }

      const { data: signInData, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      })

      if (error) throw error

      // Set name in profileStore immediately so UI shows it without waiting
      // for the async server profile hydration in onAuthStateChange.
      if (appleGivenName) {
        useProfileStore.getState().setFirstName(appleGivenName)
        // Best-effort persist to server; onAuthStateChange hydration runs after this
        // but may overwrite with empty string if no profile row exists yet. Save now
        // so the row is created and the hydration round-trip restores it correctly.
        if (signInData?.user?.id) {
          saveProfile(signInData.user.id, { first_name: appleGivenName }).catch((e) =>
            console.warn('[Auth] Apple name save to server failed (non-blocking):', e)
          )
        }
      }
    } catch (err: any) {
      if (err?.code === 'ERR_REQUEST_CANCELED') return
      console.error('[Auth] Apple sign-in error:', err)
      Alert.alert('Sign In Failed', err?.message ?? 'Could not sign in with Apple.')
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const userInfo = await GoogleSignin.signIn()
      console.log('[Auth] Google userInfo shape:', JSON.stringify(userInfo, null, 2))
      const idToken = userInfo?.data?.idToken ?? (userInfo as any)?.idToken

      if (!idToken) {
        console.error('[Auth] Google sign-in: idToken missing. Full userInfo:', userInfo)
        throw new Error('Google Sign In: no ID token returned')
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })

      if (error) throw error
    } catch (err: any) {
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) return
      console.error('[Auth] Google sign-in error:', err)
      Alert.alert('Sign In Failed', err?.message ?? 'Could not sign in with Google.')
    }
  }, [])

  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL
      if (!apiBaseUrl) {
        throw new Error('Missing EXPO_PUBLIC_API_BASE_URL')
      }

      const response = await fetch(`${apiBaseUrl}/api/auth/request-magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirectTo: 'https://omenora.com/auth-callback',
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Magic link request failed: ${response.status} ${text}`)
      }
    } catch (err: any) {
      console.error('[Auth] magic link error:', err)
      Alert.alert('Could not send magic link', err?.message ?? 'Please try again.')
      throw err
    }
  }, [])

  const resetProfile      = useProfileStore((s) => s.reset)
  const profileFirstName   = useProfileStore((s) => s.firstName)

  const signOut = useCallback(async (options?: { skipWarning?: boolean }) => {
    const performSignOut = async () => {
      // 0. Persist profile to server BEFORE wiping local state — ensures a returning
      //    user can restore their profile on next sign-in. This is a best-effort
      //    save; sign-out proceeds regardless of outcome.
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        const permanentUserId = currentSession && !(currentSession.user as any).is_anonymous
          ? currentSession.user.id
          : null
        if (permanentUserId) {
          const localStore = useProfileStore.getState()
          if (localStore.dateOfBirth) {
            await saveProfile(permanentUserId, {
              first_name:       localStore.firstName    || undefined,
              date_of_birth:    localStore.dateOfBirth,
              time_of_birth:    localStore.timeOfBirth  || undefined,
              city:             localStore.city         || undefined,
              archetype:        localStore.archetype    || undefined,
              sun_sign:         localStore.sunSign      || undefined,
              moon_sign:        localStore.moonSign     || undefined,
              rising_sign:      localStore.risingSign   || undefined,
              life_path_number: localStore.lifePathNumber ?? undefined,
            })
            console.log('[Auth] profile saved to server before sign-out for:', permanentUserId)
          }
        }
      } catch (saveErr) {
        console.warn('[Auth] pre-sign-out profile save failed (non-blocking):', saveErr)
      }

      // 1. Clear local profile state BEFORE supabase signOut — ensures the
      //    onAuthStateChange anonymous bootstrap sees a clean store, not the
      //    previous user's firstName / archetype / reading caches.
      try {
        resetProfile()
      } catch (err: any) {
        console.error('[Auth] resetProfile failed during sign-out:', err?.message)
        // Non-fatal: proceed — partial cleanup is better than a stuck sign-out.
      }

      // 2. RevenueCat sign out — only for identified (non-anonymous) users.
      //    Purchases.logOut() throws if the RC user is already anonymous; there is
      //    no identified session to end. Read session freshly to avoid stale closure.
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession && !(currentSession.user as any).is_anonymous) {
        try {
          await Purchases.logOut()
        } catch (rcErr) {
          console.warn('[Auth] Purchases.logOut failed (non-blocking):', rcErr)
        }
      }

      // 3. Supabase sign out — fires SIGNED_OUT, triggers anonymous re-bootstrap.
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[Auth] sign-out error:', error)
        Alert.alert('Sign Out Failed', error.message)
      }
      // On success, onAuthStateChange fires SIGNED_OUT → re-bootstrap handler creates a new anonymous session.
    }

    if (options?.skipWarning) {
      await performSignOut()
      return
    }

    // Warn user about losing local data tied to their current account.
    Alert.alert(
      'Sign out?',
      "You'll be signed back in anonymously. Reports and saved data tied to this account will not be available until you sign in again.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: performSignOut },
      ],
    )
  }, [resetProfile])

  const showAuthGate = useCallback((options?: { title?: string; body?: string }) => {
    const currentSession = session
    if (currentSession && !(currentSession.user as any).is_anonymous) {
      console.warn('[Auth] showAuthGate called but user is already permanent')
      return
    }
    setAuthGateState({ visible: true, title: options?.title, body: options?.body })
  }, [session])

  const hideAuthGate = useCallback(() => {
    setAuthGateState({ visible: false })
  }, [])

  const deleteAccount = useCallback(async () => {
    try {
      // a. Verify active session
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        throw new Error('No active session')
      }

      const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL
      if (!apiBaseUrl) {
        throw new Error('API base URL not configured')
      }

      // b. Backend delete — cascades all user data server-side
      const response = await fetch(`${apiBaseUrl}/api/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error((errorData as any).message || 'Account deletion failed')
      }

      // c. RevenueCat sign out (best-effort — non-blocking)
      try {
        await Purchases.logOut()
      } catch (rcErr) {
        console.warn('[Auth] Purchases.logOut failed (non-blocking):', rcErr)
      }

      // d. Apple token revocation — expo-apple-authentication ~7.2.4 has no
      //    revokeAsync API. Follow-up required: server-side revoke via
      //    Apple REST API POST /auth/revoke using the stored refresh token.

      // e. Clear all local profile/store data
      resetProfile()

      // f. Sign out locally — session is invalid, onAuthStateChange will
      //    fire SIGNED_OUT and bootstrap a new anonymous user.
      await supabase.auth.signOut()
    } catch (err: any) {
      console.error('[Auth] deleteAccount failed:', err?.message)
      Alert.alert(
        'Account Deletion Failed',
        err?.message ?? 'Could not delete your account. Please try again or contact support@omenora.com.'
      )
      throw err
    }
  }, [resetProfile])

  const handleMagicLinkUrl = useCallback(async (url: string) => {
    try {
      // Parse the url for token_hash query param
      // Supports both omenora://auth-callback?token_hash=... and https://omenora.com/account?token_hash=...
      const queryStart = url.indexOf('?')
      if (queryStart === -1) {
        console.warn('[Auth] magic link URL has no query string:', url)
        return
      }

      const queryString = url.substring(queryStart + 1)
      const params = new URLSearchParams(queryString)
      const tokenHash = params.get('token_hash')

      if (!tokenHash) {
        console.warn('[Auth] magic link URL missing token_hash:', url)
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'magiclink',
      })

      if (error) {
        console.error('[Auth] verifyOtp failed:', error.message)
        Alert.alert('Sign In Failed', error.message)
      }
      // On success, onAuthStateChange will fire and update session.
    } catch (err: any) {
      console.error('[Auth] handleMagicLinkUrl error:', err)
      Alert.alert('Sign In Failed', err?.message ?? 'Could not complete sign-in.')
    }
  }, [])

  // Derived display name: profileStore.firstName takes priority (set during onboarding
  // or after server hydration), then fall back to provider metadata if available.
  const displayName: string | null =
    profileFirstName ||
    (session?.user?.user_metadata?.['full_name'] as string | undefined) ||
    (session?.user?.user_metadata?.['name'] as string | undefined) ||
    null

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isAnonymous: (session?.user as any)?.is_anonymous ?? false,
    isLoading,
    displayName,
    signInWithApple,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
    deleteAccount,
    handleMagicLinkUrl,
    showAuthGate,
    hideAuthGate,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthGate
        visible={authGateState.visible}
        title={authGateState.title}
        body={authGateState.body}
        onClose={hideAuthGate}
      />
    </AuthContext.Provider>
  )
}

