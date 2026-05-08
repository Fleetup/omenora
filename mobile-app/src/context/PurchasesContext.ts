import { createContext } from 'react'
import type { CustomerInfo, PurchasesOffering } from 'react-native-purchases'
import { PAYWALL_RESULT } from 'react-native-purchases-ui'

export interface PurchasesContextValue {
  isReady: boolean
  isPremium: boolean
  customerInfo: CustomerInfo | null
  currentOffering: PurchasesOffering | null
  refreshCustomerInfo: () => Promise<void>
  presentPaywall: () => Promise<PAYWALL_RESULT>
  presentPaywallIfNeeded: (entitlement?: string) => Promise<PAYWALL_RESULT>
}

export const PurchasesContext = createContext<PurchasesContextValue>({
  isReady: false,
  isPremium: false,
  customerInfo: null,
  currentOffering: null,
  refreshCustomerInfo: async () => {},
  presentPaywall: async () => PAYWALL_RESULT.ERROR,
  presentPaywallIfNeeded: async () => PAYWALL_RESULT.ERROR,
})
