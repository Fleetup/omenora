import { createContext } from 'react'
import type { CustomerInfo } from 'react-native-purchases'

export interface PurchasesContextValue {
  isReady: boolean
  isPremium: boolean
  customerInfo: CustomerInfo | null
  refreshCustomerInfo: () => Promise<void>
}

export const PurchasesContext = createContext<PurchasesContextValue>({
  isReady: false,
  isPremium: false,
  customerInfo: null,
  refreshCustomerInfo: async () => {},
})
