'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { centralLogin, centralRegister, centralLogout, refreshSession, AuthAccount } from './central-auth'
import { createAuthSupabaseClient } from './supabase-auth'
import { linkCentralSession } from './sso'
import { persistSarayaAccount, clearSarayaAccount } from './saraya-account'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  hasAvatar?: boolean
  coins: number
  tokens: number
  xp: number
  level: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateBalance: (coins?: number, tokens?: number, xp?: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = 'saraya_rewards_session'
const USER_KEY = 'saraya_rewards_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Transform AuthAccount to User
  const accountToUser = (account: AuthAccount): User => ({
    id: account.id,
    email: account.email,
    name: account.name,
    avatarUrl: account.avatar_url,
    // Avatar is valid if it exists and is non-empty (data URI or URL)
    hasAvatar: !!account.avatar_url && account.avatar_url.length > 0,
    coins: account.coins || 0,
    tokens: account.tokens || 0,
    xp: account.xp || 0,
    level: account.level || 1,
  })

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = localStorage.getItem(SESSION_KEY)
        const storedUser = localStorage.getItem(USER_KEY)
        
        if (storedSession && storedUser) {
          const session = JSON.parse(storedSession)
          const userData = JSON.parse(storedUser)
          
          // Ensure hasAvatar is set based on avatarUrl (for backwards compatibility)
          if (userData.hasAvatar === undefined) {
            userData.hasAvatar = !!userData.avatarUrl && userData.avatarUrl.length > 0
            localStorage.setItem(USER_KEY, JSON.stringify(userData))
          }
          
          // Check if session is expired
          if (session.expires_at && Date.now() < session.expires_at * 1000) {
            setUser(userData)
            // Refresh user data in background
            refreshUserData(session.access_token)
          } else {
            // Try to refresh the session
            const refreshResult = await refreshSession(session.refresh_token)
            if (refreshResult.success && refreshResult.session) {
              const authClient = createAuthSupabaseClient()
              await authClient.auth.setSession({
                access_token: refreshResult.session.access_token,
                refresh_token: refreshResult.session.refresh_token,
              })
              localStorage.setItem(SESSION_KEY, JSON.stringify(refreshResult.session))
              if (refreshResult.account) {
                const newUser = accountToUser(refreshResult.account)
                setUser(newUser)
                localStorage.setItem(USER_KEY, JSON.stringify(newUser))
                persistSarayaAccount(refreshResult.account)
              }
              linkCentralSession(refreshResult.session, window.location.href)
            } else {
              // Clear invalid session
              localStorage.removeItem(SESSION_KEY)
              localStorage.removeItem(USER_KEY)
            }
          }
        } else {
          // No local session - check if SSO established a Supabase session
          const authClient = createAuthSupabaseClient()
          const { data: { session: supaSession } } = await authClient.auth.getSession()
          
          if (supaSession?.access_token) {
            // SSO session exists - hydrate user data from central API
            try {
              const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${supaSession.access_token}` },
                cache: 'no-store',
              })
              
              if (response.ok) {
                const data = await response.json()
                if (data.success && data.account) {
                  const newUser = accountToUser(data.account)
                  setUser(newUser)
                  // Store session and user for future loads
                  localStorage.setItem(SESSION_KEY, JSON.stringify({
                    access_token: supaSession.access_token,
                    refresh_token: supaSession.refresh_token,
                    expires_at: supaSession.expires_at,
                  }))
                  localStorage.setItem(USER_KEY, JSON.stringify(newUser))
                  persistSarayaAccount(data.account)
                }
              }
            } catch (error) {
              console.error('Error hydrating from SSO session:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error loading session:', error)
        localStorage.removeItem(SESSION_KEY)
        localStorage.removeItem(USER_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  // Refresh user data from API
  const refreshUserData = async (accessToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.account) {
          const newUser = accountToUser(data.account)
          
          // Preserve locally stored avatar if API doesn't have one
          const storedUser = localStorage.getItem(USER_KEY)
          if (storedUser) {
            const existingUser = JSON.parse(storedUser)
            // If we have a local avatar and API doesn't have one, keep local
            if (existingUser.avatarUrl && existingUser.avatarUrl.length > 0 && !newUser.avatarUrl) {
              newUser.avatarUrl = existingUser.avatarUrl
              newUser.hasAvatar = true
            }
          }
          
          setUser(newUser)
          localStorage.setItem(USER_KEY, JSON.stringify(newUser))
          persistSarayaAccount(data.account)
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await centralLogin(email, password)
      
      if (result.success && result.session && result.account) {
        const authClient = createAuthSupabaseClient()
        await authClient.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        })
        persistSarayaAccount(result.account)
        const newUser = accountToUser(result.account)
        setUser(newUser)
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.session))
        localStorage.setItem(USER_KEY, JSON.stringify(newUser))
        linkCentralSession(result.session, window.location.href)
        
        return { success: true }
      }
      
      return { success: false, error: result.error || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await centralRegister(email, password, name)
      
      if (result.success && result.session && result.account) {
        const authClient = createAuthSupabaseClient()
        await authClient.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        })
        persistSarayaAccount(result.account)
        const newUser = accountToUser(result.account)
        setUser(newUser)
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.session))
        localStorage.setItem(USER_KEY, JSON.stringify(newUser))
        linkCentralSession(result.session, window.location.href)
        
        return { success: true }
      }
      
      return { success: false, error: result.error || 'Registration failed' }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const logout = async () => {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY)
      if (storedSession) {
        const session = JSON.parse(storedSession)
        await centralLogout(session.access_token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(USER_KEY)
      await createAuthSupabaseClient().auth.signOut()
      clearSarayaAccount()
    }
  }

  const refreshUser = useCallback(async () => {
    // Fetch fresh data from API to get updated balances
    const storedSession = localStorage.getItem(SESSION_KEY)
    if (storedSession) {
      const session = JSON.parse(storedSession)
      if (session.access_token) {
        await refreshUserData(session.access_token)
        return
      }
    }
    // Fallback to localStorage if no session
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    }
  }, [])

  const updateBalance = (coins?: number, tokens?: number, xp?: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        coins: coins !== undefined ? coins : user.coins,
        tokens: tokens !== undefined ? tokens : user.tokens,
        xp: xp !== undefined ? xp : user.xp,
      }
      setUser(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      persistSarayaAccount({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar_url: updatedUser.avatarUrl,
        coins: updatedUser.coins,
        tokens: updatedUser.tokens,
        xp: updatedUser.xp,
        level: updatedUser.level,
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to require authentication
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, redirectTo, router])
  
  return { user, isLoading, isAuthenticated }
}

// Hook to require avatar setup
export function useRequireAvatar() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Skip if still loading or not authenticated
    if (isLoading || !isAuthenticated || !user) return
    
    // Skip if already on avatar page or auth pages
    if (pathname?.startsWith('/auth/')) return
    
    // Check if user has skipped avatar setup
    const skippedUserId = localStorage.getItem('saraya_avatar_skipped')
    if (skippedUserId === user.id) return
    
    // Redirect to avatar creation if no avatar
    if (!user.hasAvatar) {
      router.push('/auth/avatar')
    }
  }, [isLoading, isAuthenticated, user, pathname, router])
  
  return { user, isLoading, needsAvatar: isAuthenticated && user && !user.hasAvatar }
}
