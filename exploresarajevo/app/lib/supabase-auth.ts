import { createBrowserClient } from '@supabase/ssr'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

let authClient: ReturnType<typeof createBrowserClient> | null = null

// Clear stale auth data on token refresh errors
function clearStaleAuthData() {
  if (typeof window !== 'undefined') {
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key)
      }
    })
  }
}

export function createAuthSupabaseClient() {
  if (typeof window !== 'undefined') {
    if (!authClient) {
      authClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookieOptions: {
            name: 'sb-auth-token',
          },
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        }
      )
      
      // Listen for auth errors and clear stale data
      authClient.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed, clear stale data
          clearStaleAuthData()
        }
      })
    }
    return authClient
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-auth-token',
      },
    }
  )
}

export { clearStaleAuthData }
