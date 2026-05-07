import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthGate } from '../components/organisms/AuthGate'

type AuthContextValue = {
  session: Session | null
  user: User | null
  isAnonymous: boolean
  isLoading: boolean
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: (options?: { skipWarning?: boolean }) => Promise<void>
  deleteAccount: () => Promise<void>
  showAuthGate: (options?: { title?: string; body?: string }) => void
  hideAuthGate: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) setSession(newSession)
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

      if (!credential.identityToken) {
        throw new Error('Apple Sign In: no identity token returned')
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      })

      if (error) throw error
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
      const idToken = userInfo?.data?.idToken ?? (userInfo as any)?.idToken

      if (!idToken) {
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
          redirectTo: 'omenora://auth-callback',
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

  const signOut = useCallback(async (options?: { skipWarning?: boolean }) => {
    const performSignOut = async () => {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[Auth] sign-out error:', error)
        Alert.alert('Sign Out Failed', error.message)
      }
      // Auth state listener will re-run bootstrap and create a new anonymous session.
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
  }, [])

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
    // Account deletion requires a backend endpoint with service-role access.
    // Phase 0.5.15 implements the actual flow. This stub keeps the contract
    // visible so consuming UI code can wire to it now.
    Alert.alert(
      'Account deletion',
      'Account deletion is not yet implemented. This will be available before launch.',
    )
  }, [])

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isAnonymous: (session?.user as any)?.is_anonymous ?? false,
    isLoading,
    signInWithApple,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
    deleteAccount,
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

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
