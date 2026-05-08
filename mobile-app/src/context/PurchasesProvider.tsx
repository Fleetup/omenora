import React, { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesError,
} from 'react-native-purchases'
import { useAuth } from './useAuth'
import { PurchasesContext } from './PurchasesContext'

interface Props {
  children: React.ReactNode
}

const PREMIUM_ENTITLEMENT_ID = 'premium'

/**
 * RevenueCat provider.
 *
 * Initializes the SDK once on mount. Wires RC user identity to Supabase
 * auth: when the user signs in (anonymous → permanent), calls
 * Purchases.logIn(supabaseUserId). On sign out, calls Purchases.logOut.
 *
 * Exposes isPremium derived from the 'premium' entitlement on
 * customerInfo. Listens for customer info updates from RC.
 *
 * Test Store mode: the API key starts with `test_` — the SDK simulates
 * purchases via a modal instead of hitting the real App Store.
 */
export function PurchasesProvider({ children }: Props) {
  const { user, isAnonymous } = useAuth()
  const [isReady, setIsReady] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  // Initialize SDK once
  useEffect(() => {
    const initialize = async () => {
      try {
        const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS

        if (!apiKey) {
          console.warn('[Purchases] EXPO_PUBLIC_REVENUECAT_API_KEY_IOS not set — SDK disabled')
          setIsReady(true)
          return
        }

        if (Platform.OS !== 'ios') {
          console.warn('[Purchases] non-iOS platform — SDK disabled')
          setIsReady(true)
          return
        }

        // Verbose logging in dev only
        if (__DEV__) {
          await Purchases.setLogLevel(LOG_LEVEL.VERBOSE)
        }

        // Configure with no app user ID initially. logIn fires later on auth state.
        Purchases.configure({ apiKey })

        // Initial customer info fetch
        const info = await Purchases.getCustomerInfo()
        setCustomerInfo(info)

        // Subscribe to live updates
        Purchases.addCustomerInfoUpdateListener((updatedInfo) => {
          setCustomerInfo(updatedInfo)
        })

        setIsReady(true)
        console.log('[Purchases] SDK initialized')
      } catch (err: any) {
        const purchasesErr = err as PurchasesError
        console.error('[Purchases] init failed:', purchasesErr?.message ?? err)
        setIsReady(true) // Fail open — app should still work without purchases
      }
    }

    initialize()
  }, [])

  // Sync RC user ID with Supabase auth state
  useEffect(() => {
    if (!isReady || !user) return

    const syncUserIdentity = async () => {
      try {
        if (isAnonymous) {
          // Anonymous Supabase user — let RC use its own anonymous ID
          // (don't call logIn for anonymous Supabase users)
          return
        }

        // Permanent user — log in with Supabase user ID
        const { customerInfo: updatedInfo } = await Purchases.logIn(user.id)
        setCustomerInfo(updatedInfo)
        console.log('[Purchases] logged in as:', user.id)
      } catch (err: any) {
        console.error('[Purchases] logIn failed:', err?.message ?? err)
      }
    }

    syncUserIdentity()
  }, [isReady, user?.id, isAnonymous])

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo()
      setCustomerInfo(info)
    } catch (err: any) {
      console.error('[Purchases] refresh failed:', err?.message ?? err)
    }
  }, [])

  const isPremium =
    customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID] !== undefined

  return (
    <PurchasesContext.Provider
      value={{ isReady, isPremium, customerInfo, refreshCustomerInfo }}
    >
      {children}
    </PurchasesContext.Provider>
  )
}
