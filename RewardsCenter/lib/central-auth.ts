/**
 * Central Authentication System Integration
 * 
 * This module handles all authentication through the centralized account system.
 * Client-side calls go through local API proxy (/api/auth/*) to avoid HTTPS/HTTP mixed content issues.
 * Server-side calls can use CENTRAL_API_URL directly.
 */

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
}

export interface AuthAccount {
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

export interface LoginResponse {
  success: boolean
  error?: string
  user?: AuthUser
  session?: AuthSession
  account?: AuthAccount
}

export interface RegisterResponse {
  success: boolean
  error?: string
  user?: AuthUser
  session?: AuthSession
  account?: AuthAccount
}

/**
 * Login through the central account system
 * Uses local API proxy to avoid mixed content issues
 */
export async function centralLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Central login error:', error)
    return { success: false, error: 'Network error during login' }
  }
}

/**
 * Register through the central account system
 * Uses local API proxy to avoid mixed content issues
 */
export async function centralRegister(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Central register error:', error)
    return { success: false, error: 'Network error during registration' }
  }
}

/**
 * Get current user from access token (server-side)
 */
export async function centralGetUser(accessToken: string): Promise<{
  success: boolean
  error?: string
  user?: AuthUser
  account?: AuthAccount
}> {
  try {
    const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
    const response = await fetch(`${CENTRAL_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Central get user error:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Refresh session tokens (server-side)
 */
export async function centralRefreshSession(refreshToken: string): Promise<{
  success: boolean
  error?: string
  session?: AuthSession
}> {
  try {
    const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
    const response = await fetch(`${CENTRAL_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Central refresh session error:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Logout - clear local session
 */
export async function centralLogout(accessToken?: string): Promise<void> {
  // Optionally notify server about logout
  if (accessToken) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
    } catch (error) {
      console.error('Logout API error:', error)
    }
  }
  
  // Clear any local storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_session')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_account')
  }
}

/**
 * Get current auth session from localStorage
 */
export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const session = localStorage.getItem('auth_session')
    return session ? JSON.parse(session) : null
  } catch {
    return null
  }
}

/**
 * Refresh session tokens
 */
export async function refreshSession(refreshToken: string): Promise<{
  success: boolean
  error?: string
  session?: AuthSession
  account?: AuthAccount
}> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    return await response.json()
  } catch (error) {
    console.error('Refresh session error:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Store session data locally
 */
export function storeSession(session: AuthSession, user: AuthUser, account: AuthAccount): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_session', JSON.stringify(session))
    localStorage.setItem('auth_user', JSON.stringify(user))
    localStorage.setItem('auth_account', JSON.stringify(account))
  }
}

/**
 * Get stored session
 */
export function getStoredSession(): { session: AuthSession | null; user: AuthUser | null; account: AuthAccount | null } {
  if (typeof window === 'undefined') {
    return { session: null, user: null, account: null }
  }

  try {
    const session = localStorage.getItem('auth_session')
    const user = localStorage.getItem('auth_user')
    const account = localStorage.getItem('auth_account')

    return {
      session: session ? JSON.parse(session) : null,
      user: user ? JSON.parse(user) : null,
      account: account ? JSON.parse(account) : null,
    }
  } catch {
    return { session: null, user: null, account: null }
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(session: AuthSession | null): boolean {
  if (!session) return true
  return Date.now() / 1000 > session.expires_at
}

/**
 * Update stored account data (e.g., after balance change)
 */
export function updateStoredAccount(account: Partial<AuthAccount>): void {
  if (typeof window !== 'undefined') {
    const current = localStorage.getItem('auth_account')
    if (current) {
      const parsed = JSON.parse(current)
      localStorage.setItem('auth_account', JSON.stringify({ ...parsed, ...account }))
    }
  }
}
