import { NextRequest, NextResponse } from 'next/server'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'https://accounts.saraya.solutions'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

// Cache for all accounts (keyed by account ID)
let accountsCache: Map<string, { name: string; avatar: string }> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Fetch all accounts from central API and cache them
async function loadAllAccounts() {
  const now = Date.now()
  
  // Return cached data if still valid
  if (accountsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return accountsCache
  }
  
  try {
    // Fetch accounts with a large limit to get all users
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts?limit=1000`, {
      headers: { 'x-admin-email': ADMIN_EMAIL }
    })
    
    if (response.ok) {
      const data = await response.json()
      const accounts = data.data || []
      
      // Build cache map keyed by account ID
      accountsCache = new Map()
      for (const account of accounts) {
        const name = account.name || 'Unknown User'
        accountsCache.set(account.id, {
          name,
          avatar: account.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`,
        })
      }
      cacheTimestamp = now
      console.log(`[user-info] Loaded ${accountsCache.size} accounts into cache`)
    }
  } catch (error) {
    console.error('[user-info] Error fetching accounts:', error)
  }
  
  if (!accountsCache) {
    accountsCache = new Map()
  }
  
  return accountsCache
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
    }

    const cache = await loadAllAccounts()
    
    if (cache.has(accountId)) {
      return NextResponse.json(cache.get(accountId))
    }
    
    // Fallback for unknown users
    return NextResponse.json({
      name: 'User',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=6366f1`,
    })

  } catch (error) {
    console.error('Error in GET /api/user-info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
