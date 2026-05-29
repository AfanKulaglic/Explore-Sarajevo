import { createBrowserClient } from '@supabase/ssr'
import type { AuthError } from '@supabase/supabase-js'

let authClient: ReturnType<typeof createBrowserClient> | null = null

export type AuthBrowserClient = NonNullable<typeof authClient>

type AuthGetUserResult = Awaited<ReturnType<AuthBrowserClient['auth']['getUser']>>

/** Dedupes concurrent `getUser()` on the auth singleton (React Strict Mode double-mount → lock / refresh spam). */
let authGetUserInFlight: Promise<AuthGetUserResult> | null = null

/** Stops GoTrue auto-refresh timers, clears storage, drops singleton so the next client is clean. */
export async function clearAuthSessionAndResetSingleton(client: AuthBrowserClient) {
  const instance = client
  try {
    await instance.auth.stopAutoRefresh()
  } catch {
    /* ignore */
  }
  try {
    await instance.auth.signOut({ scope: 'local' })
  } catch {
    /* ignore — session may already be broken */
  }
  clearStaleAuthData()
  if (authClient === instance) {
    authClient = null
  }
}

/** True when the session cannot be refreshed; caller should reset client (avoids console / network spam). */
export function isStaleSessionAuthError(error: AuthError | null | undefined): boolean {
  if (!error) return false
  const code = String(error.code ?? '').toLowerCase()
  if (
    code === 'refresh_token_not_found' ||
    code === 'invalid_refresh_token' ||
    code === 'bad_jwt' ||
    code === 'jwt_expired' ||
    code === 'session_not_found' ||
    code.includes('refresh')
  ) {
    return true
  }
  const m = (error.message || '').toLowerCase()
  return (
    m.includes('refresh_token') ||
    m.includes('invalid refresh') ||
    m.includes('refresh token not found') ||
    m.includes('jwt expired') ||
    m.includes('invalid grant') ||
    m.includes('session missing') ||
    m.includes('session not found')
  )
}

/**
 * Single-flight `auth.getUser()` for the shared auth client — avoids parallel refresh / `sb-auth-token` lock races.
 */
export function getAuthUserSingleFlight(client: AuthBrowserClient): Promise<AuthGetUserResult> {
  if (!authGetUserInFlight) {
    authGetUserInFlight = client.auth.getUser().finally(() => {
      authGetUserInFlight = null
    })
  }
  return authGetUserInFlight as Promise<AuthGetUserResult>
}

/** Clear Supabase session cookies + localStorage (stops refresh_token 400 loops). */
export function clearStaleAuthData() {
  if (typeof window === 'undefined') return
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-')) {
      localStorage.removeItem(key)
    }
  })
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('sb-')) {
        sessionStorage.removeItem(key)
      }
    })
  } catch {
    /* ignore */
  }
}

/**
 * Supabase client for the central auth project (same pattern as explore-sarajevo / pametno-saraya).
 */
export function createAuthSupabaseClient() {
  if (typeof window !== 'undefined') {
    if (!authClient) {
      authClient = createBrowserClient(
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!,
        {
          cookieOptions: {
            name: 'sb-auth-token',
          },
          auth: {
            // Off until we know the session is valid — stale cookies otherwise spam
            // `refresh_token` 400s in a tight loop (guest / expired central auth).
            autoRefreshToken: false,
            persistSession: true,
            detectSessionInUrl: true,
          },
        }
      )
    }
    return authClient
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-auth-token',
      },
    }
  )
}
