import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for the CENTRAL ACCOUNT SYSTEM authentication
 * This connects to the shared authentication database, NOT the local quiz database.
 * 
 * Use this client for:
 * - Setting session tokens from central auth
 * - User authentication state
 * - Checking logged in user
 * 
 * Do NOT use this for:
 * - Quiz data operations (use the regular supabase client for that)
 */

// Singleton client for browser usage
let authClient: ReturnType<typeof createBrowserClient> | null = null

export function createAuthSupabaseClient() {
  if (typeof window !== 'undefined') {
    // Browser: use singleton to avoid multiple instance warnings
    if (!authClient) {
      authClient = createBrowserClient(
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!,
        {
          cookieOptions: {
            name: 'sb-auth-token',
          },
        }
      )
    }
    return authClient
  }
  
  // Server-side during build/prerender
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
