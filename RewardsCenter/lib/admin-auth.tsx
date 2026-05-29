'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter} from 'next/navigation'
import { createAuthSupabaseClient } from './supabase-auth'
import { linkCentralSession } from './sso'

interface AdminUser {
  id: string
  email: string
  name?: string
}

interface AdminSession {
  access_token: string
  refresh_token: string
  expires_at: number
}

interface AdminAuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const ADMIN_SESSION_KEY = 'saraya_admin_session'
const ADMIN_USER_KEY = 'saraya_admin_user'

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Handle client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load session on mount
  useEffect(() => {
    if (!mounted) return
    
    const loadSession = async () => {
      try {
        const storedSession = localStorage.getItem(ADMIN_SESSION_KEY)
        const storedAdmin = localStorage.getItem(ADMIN_USER_KEY)
        
        if (storedSession && storedAdmin) {
          const session: AdminSession = JSON.parse(storedSession)
          const adminData: AdminUser = JSON.parse(storedAdmin)
          
          // Check if session is expired
          if (session.expires_at && Date.now() < session.expires_at * 1000) {
            // Session is valid - trust it (admin was verified during login)
            setAdmin(adminData)
          } else {
            // Session expired - clear everything including Supabase session
            localStorage.removeItem(ADMIN_SESSION_KEY)
            localStorage.removeItem(ADMIN_USER_KEY)
            try {
              const authClient = createAuthSupabaseClient()
              await authClient.auth.signOut()
            } catch {
              // Ignore signOut errors
            }
          }
        } else {
          // No admin session - make sure Supabase session is also cleared
          // This prevents stale Supabase tokens from causing 400 errors
          try {
            const authClient = createAuthSupabaseClient()
            await authClient.auth.signOut()
          } catch {
            // Ignore signOut errors
          }
        }
      } catch (error) {
        console.error('Error loading admin session:', error)
        localStorage.removeItem(ADMIN_SESSION_KEY)
        localStorage.removeItem(ADMIN_USER_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [mounted])

  const login = async (email: string, password: string) => {
    try {
      // Authenticate with Account-System - server validates admin access
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid email or password' }
      }

      // Server already verified admin status
      const adminUser: AdminUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      }

      if (data.session) {
        const authClient = createAuthSupabaseClient()
        await authClient.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(data.session))
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser))
        setAdmin(adminUser)
        linkCentralSession(data.session, window.location.href)
        return { success: true }
      }

      setAdmin(adminUser)
      return { success: true }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const logout = useCallback(async () => {
    try {
      const storedSession = localStorage.getItem(ADMIN_SESSION_KEY)
      if (storedSession) {
        const session: AdminSession = JSON.parse(storedSession)
        // Call logout API
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        }).catch(() => {})
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAdmin(null)
      localStorage.removeItem(ADMIN_SESSION_KEY)
      localStorage.removeItem(ADMIN_USER_KEY)
      router.push('/admin/login')
    }
  }, [router])

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

// Helper function to refresh admin session
async function refreshAdminSession(refreshToken: string): Promise<{
  success: boolean
  session?: AdminSession
  user?: AdminUser
  error?: string
}> {
  try {
    const response = await fetch('/api/admin/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return { success: false, error: data.error }
    }

    return {
      success: true,
      session: data.session,
      user: data.user,
    }
  } catch (error) {
    return { success: false, error: 'Failed to refresh session' }
  }
}
