import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client-side Supabase client (safe for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'rewardscenter' },
})

// Server-side Supabase client with service role (for admin operations)
// Only created on server-side where the service key is available
let _supabaseAdmin: SupabaseClient | null = null

export const supabaseAdmin = (() => {
  // Only create on server-side
  if (typeof window === 'undefined' && supabaseServiceKey) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
    return _supabaseAdmin.schema('rewardscenter')
  }
  // Return a proxy that throws helpful error on client-side
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error('supabaseAdmin cannot be used on the client side. Use supabase instead.')
    }
  })
})()

/** Root service-role client (default schema). Use for Storage; use `supabaseAdmin` for `rewardscenter` tables. */
export function getSupabaseAdminRoot(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdminRoot cannot be used on the client.')
  }
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabaseAdmin
}

// Helper to create a server client
export function createSupabaseServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }).schema('rewardscenter')
}
