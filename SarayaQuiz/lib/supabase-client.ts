import { createBrowserClient } from '@supabase/ssr'

// Singleton client for browser usage
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseClient() {
  if (typeof window !== 'undefined') {
    // Browser: use singleton to avoid multiple instance warnings
    if (!browserClient) {
      browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return browserClient.schema('sarayaquiz')
  }

  // Server-side during build/prerender - create a basic client
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ).schema('sarayaquiz')
}
