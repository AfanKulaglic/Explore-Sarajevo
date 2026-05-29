import { createBrowserClient } from '@supabase/ssr'

let authClient: ReturnType<typeof createBrowserClient> | null = null

export function createAuthSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL || !process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_AUTH_SUPABASE_* env vars for central auth client')
  }

  if (typeof window !== 'undefined') {
    if (!authClient) {
      authClient = createBrowserClient(
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL,
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY,
        {
          cookieOptions: {
            name: 'sb-auth-token',
          },
          auth: {
            // Disable auto-refresh to prevent 400 errors with stale tokens
            // We handle session management manually in auth-context
            autoRefreshToken: false,
            persistSession: true,
            detectSessionInUrl: false,
          },
        }
      )
    }
    return authClient
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL,
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        name: 'sb-auth-token',
      },
      auth: {
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  )
}
