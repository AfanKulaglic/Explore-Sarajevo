/**
 * Central Authentication System Integration
 * 
 * This module handles all authentication through the centralized account system.
 * All platforms should use these functions for login/register instead of direct Supabase auth.
 * 
 * Note: Client-side calls go through local API proxy (/api/auth/*) to avoid HTTPS/HTTP mixed content issues.
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
    // Use relative URL - goes through local API proxy
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
    // Use relative URL - goes through local API proxy
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
 * Get current user from access token
 * Note: This is typically called server-side, so uses direct URL
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
 * Refresh session tokens
 * Note: This is typically called server-side, so uses direct URL
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
    console.error('Central refresh error:', error)
    return { success: false, error: 'Network error' }
  }
}
