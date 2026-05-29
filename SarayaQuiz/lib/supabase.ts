import { createServerClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// ============================================
// QUIZ DATABASE CLIENTS (for quiz/attempt data)
// ============================================

// Singleton instance for service client to avoid connection issues
let serviceClientInstance: SupabaseClient | null = null

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ).schema('sarayaquiz')
}

export function createSupabaseServiceClient() {
  if (!serviceClientInstance) {
    serviceClientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return serviceClientInstance.schema('sarayaquiz')
}

// ============================================
// AUTH CLIENTS (for central account system authentication)
// ============================================

export async function createSupabaseServerClient() {
  // This is the AUTH client - uses the central account system's Supabase
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      cookieOptions: {
        name: 'sb-auth-token',
      },
    }
  )
}

// ============================================
// CENTRAL ACCOUNT SYSTEM SERVICE CLIENT
// ============================================

let centralServiceClientInstance: SupabaseClient | null = null

export function createCentralAccountServiceClient() {
  if (!centralServiceClientInstance) {
    // Use the central account system's Supabase with service role for server-side queries
    const centralUrl = process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL
    // IMPORTANT: Use the central account system's service key, not SarayaQuiz's
    const centralServiceKey = process.env.CENTRAL_SUPABASE_SERVICE_KEY
    
    if (!centralUrl) {
      console.warn('[createCentralAccountServiceClient] Central account Supabase URL not configured')
      return null
    }
    
    if (!centralServiceKey) {
      console.warn('[createCentralAccountServiceClient] Central Supabase service key not configured - add CENTRAL_SUPABASE_SERVICE_KEY to .env')
      return null
    }
    
    centralServiceClientInstance = createClient(
      centralUrl,
      centralServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    console.log('[createCentralAccountServiceClient] Client created for:', centralUrl)
  }
  return centralServiceClientInstance.schema('accountsystem')
}

// Fetch account details from central account system
export async function fetchAccountsFromCentral(account_ids: string[]): Promise<Map<string, { name: string; email: string }>> {
  const accountMap = new Map<string, { name: string; email: string }>()
  
  if (account_ids.length === 0) return accountMap
  
  console.log(`[fetchAccountsFromCentral] Fetching ${account_ids.length} accounts:`, account_ids)
  
  try {
    // Try direct database query first (more reliable)
    const centralClient = createCentralAccountServiceClient()
    if (centralClient) {
      const { data: accounts, error } = await centralClient
        .from('accounts')
        .select('id, name, email')
        .in('id', account_ids)
      
      if (!error && accounts && accounts.length > 0) {
        console.log(`[fetchAccountsFromCentral] Found ${accounts.length} accounts via direct DB`)
        accounts.forEach((acc: any) => {
          accountMap.set(acc.id, { name: acc.name || 'Unknown', email: acc.email || '' })
        })
      } else if (error) {
        console.warn('[fetchAccountsFromCentral] DB query error:', error.message)
      }
    }
    
    // If we still have missing accounts, try the API
    const missingIds = account_ids.filter(id => !accountMap.has(id))
    if (missingIds.length > 0) {
      console.log(`[fetchAccountsFromCentral] Trying API for ${missingIds.length} missing accounts`)
      
      const centralApiUrl = process.env.CENTRAL_API_URL || 'https://accounts.saraya.solutions'
      const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0] || 'eldardzuho2000@gmail.com'
      
      for (const account_id of missingIds) {
        try {
          const response = await fetch(`${centralApiUrl}/api/accounts/${account_id}`, {
            headers: {
              'x-admin-email': adminEmail,
            },
            cache: 'no-store',
          })
          
          if (response.ok) {
            const data = await response.json()
            const account = data.data || data
            if (account && account.name) {
              accountMap.set(account_id, {
                name: account.name,
                email: account.email || '',
              })
              console.log(`[fetchAccountsFromCentral] Found via API: ${account_id} -> ${account.name}`)
            }
          } else {
            console.warn(`[fetchAccountsFromCentral] API returned ${response.status} for ${account_id}`)
          }
        } catch (err) {
          console.warn(`[fetchAccountsFromCentral] API error for ${account_id}:`, err)
        }
      }
    }
    
    console.log(`[fetchAccountsFromCentral] Final result: ${accountMap.size}/${account_ids.length} accounts found`)
  } catch (error) {
    console.error('[fetchAccountsFromCentral] Error:', error)
  }
  
  return accountMap
}

