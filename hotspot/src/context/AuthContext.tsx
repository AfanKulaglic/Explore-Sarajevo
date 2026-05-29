'use client'

/**
 * Auth Context for SarayaConnectHS
 * 
 * Provides automatic SSO integration with accounts.saraya.solutions
 * 
 * Key behaviors:
 * - Silently checks if user is authenticated via central auth
 * - If authenticated, provides user info throughout the app
 * - If not authenticated, that's fine - the app works without login
 * - NO manual login required - either SSO works or it doesn't
 * 
 * This is a "soft auth" approach - the portal is fully usable without login,
 * but logged-in users get personalized features (account linked rewards, etc.)
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  clearAuthSessionAndResetSingleton,
  clearStaleAuthData,
  createAuthSupabaseClient,
  getAuthUserSingleFlight,
  isStaleSessionAuthError,
} from '@/lib/supabase-auth'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

// =============================================================================
// TYPES
// =============================================================================

interface User {
  id: string
  email: string
  name?: string
}

interface AuthAccount {
  id: string
  email: string
  name: string
  status: string
  avatar_url?: string
  coins: number
  tokens: number
  xp: number
  level: number
}

interface AuthContextType {
  /** The authenticated user, or null if not logged in */
  user: User | null
  /** Extended account info from central auth */
  account: AuthAccount | null
  /** Whether auth check is in progress */
  loading: boolean
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Sign out (clears local state, may or may not affect central auth) */
  signOut: () => Promise<void>
  /** Refresh account info from central auth */
  refreshAccount: () => Promise<void>
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  account: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshAccount: async () => {},
})

// =============================================================================
// PROVIDER
// =============================================================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [account, setAccount] = useState<AuthAccount | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * Fetches extended account info from central auth
   */
  const fetchAccountInfo = async (userId: string): Promise<AuthAccount | null> => {
    try {
      // Try to get cached account first
      const cached = localStorage.getItem('saraya_account')
      if (cached) {
        const parsed = JSON.parse(cached)
        // Check if cache is still valid (less than 5 minutes old)
        if (parsed.userId === userId && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          return parsed.account
        }
      }

      // Fetch from central API
      const response = await fetch(`/api/auth/account?userId=${userId}`)
      if (!response.ok) return null

      const data = await response.json()
      if (data.success && data.account) {
        // Cache the account info
        localStorage.setItem('saraya_account', JSON.stringify({
          userId,
          account: data.account,
          timestamp: Date.now(),
        }))
        return data.account
      }
      return null
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] Error fetching account info:', error)
      }
      return null
    }
  }

  /**
   * Checks for existing SSO session (aligned with explore-sarajevo / pametno-saraya auth-context).
   */
  useEffect(() => {
    const supabase = createAuthSupabaseClient()
    let isMounted = true

    const checkUser = async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await getAuthUserSingleFlight(supabase)

        if (error) {
          if (isStaleSessionAuthError(error)) {
            await clearAuthSessionAndResetSingleton(supabase)
          } else if (process.env.NODE_ENV === 'development') {
            console.error('[Auth] getUser:', error.message)
          }
          if (isMounted) {
            setUser(null)
            setAccount(null)
            localStorage.removeItem('saraya_account')
            setLoading(false)
          }
          return
        }

        if (isMounted && authUser) {
          const userData: User = {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.name,
          }
          setUser(userData)

          const accountInfo = await fetchAccountInfo(authUser.id)
          if (accountInfo) {
            setAccount(accountInfo)
          }

          try {
            await supabase.auth.startAutoRefresh()
          } catch {
            /* ignore */
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Auth] Error checking auth:', error)
        }
        clearStaleAuthData()
        if (isMounted) {
          setUser(null)
          setAccount(null)
          localStorage.removeItem('saraya_account')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT' || !session) {
        try {
          await supabase.auth.stopAutoRefresh()
        } catch {
          /* ignore */
        }
        setUser(null)
        setAccount(null)
        localStorage.removeItem('saraya_account')
      } else if (session.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
        }
        setUser(userData)

        const accountInfo = await fetchAccountInfo(session.user.id)
        if (accountInfo) {
          setAccount(accountInfo)
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            await supabase.auth.startAutoRefresh()
          } catch {
            /* ignore */
          }
        }
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Sign out
   */
  const signOut = async () => {
    const supabase = createAuthSupabaseClient()
    try {
      await supabase.auth.signOut()
    } catch {
      /* network / already cleared */
    }
    await clearAuthSessionAndResetSingleton(supabase)
    localStorage.removeItem('saraya_account')
    setUser(null)
    setAccount(null)
  }

  /**
   * Refresh account info
   */
  const refreshAccount = async () => {
    if (user) {
      // Clear cache to force refresh
      localStorage.removeItem('saraya_account')
      const accountInfo = await fetchAccountInfo(user.id)
      if (accountInfo) {
        setAccount(accountInfo)
      }
    }
  }

  const value: AuthContextType = {
    user,
    account,
    loading,
    isAuthenticated: !!user,
    signOut,
    refreshAccount,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}

/**
 * Hook to check if user is authenticated (convenience)
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated, loading } = useAuth()
  return !loading && isAuthenticated
}
