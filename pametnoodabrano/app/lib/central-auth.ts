/**
 * Central Authentication System Integration
 * 
 * This module handles all authentication through the centralized account system.
 * Client-side calls go through local API proxy (/api/auth/*) to avoid HTTPS/HTTP mixed content issues.
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
    return { success: false, error: 'Greška pri povezivanju' }
  }
}

/**
 * Register through the central account system
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
    return { success: false, error: 'Greška pri registraciji' }
  }
}
