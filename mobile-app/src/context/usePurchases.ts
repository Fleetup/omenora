import { useContext } from 'react'
import { PurchasesContext, type PurchasesContextValue } from './PurchasesContext'

export const usePurchases = (): PurchasesContextValue => useContext(PurchasesContext)
