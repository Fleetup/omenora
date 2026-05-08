import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  isAnonymous: boolean
  isLoading: boolean
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: (options?: { skipWarning?: boolean }) => Promise<void>
  deleteAccount: () => Promise<void>
  handleMagicLinkUrl: (url: string) => Promise<void>
  showAuthGate: (options?: { title?: string; body?: string }) => void
  hideAuthGate: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
