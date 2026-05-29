import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

// Cache for all accounts - fetched once per request cycle
let accountsCache: Map<string, any> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30000 // 30 seconds

// Helper to fetch all accounts and cache them
async function getAllAccountsCached(): Promise<Map<string, any>> {
  const now = Date.now()
  
  // Return cached data if still valid
  if (accountsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return accountsCache
  }
  
  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts?limit=1000`, {
      headers: { 'x-admin-email': ADMIN_EMAIL }
    })
    
    if (response.ok) {
      const data = await response.json()
      const accounts = data.data || []
      
      // Build a map for O(1) lookups by ID
      accountsCache = new Map()
      for (const account of accounts) {
        accountsCache.set(account.id, account)
      }
      cacheTimestamp = now
      return accountsCache
    }
  } catch (e) {
    console.error('[getAllAccountsCached] Error fetching accounts:', e)
  }
  
  // Return empty map on failure, but don't cache it
  return new Map()
}

// Helper to get user info from central system (uses cache)
async function getUserInfo(userId: string) {
  try {
    const accounts = await getAllAccountsCached()
    const account = accounts.get(userId)
    
    if (account) {
      return {
        id: account.id,
        email: account.email,
        name: account.name || account.email?.split('@')[0] || 'Anonymous',
        avatar_url: account.avatar_url
      }
    }
  } catch (e) {
    console.error('[getUserInfo] Error:', e)
  }
  return null
}

/**
 * GET /api/friends/requests - Get pending friend requests
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') || 'received' // 'received' or 'sent'

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Pending requests: accepted_at is null
    let query = supabaseAdmin
      .from('friendships')
      .select('*')
      .is('accepted_at', null)
      .order('created_at', { ascending: false })

    if (type === 'received') {
      query = query.eq('addressee_id', userId)
    } else {
      query = query.eq('requester_id', userId)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('Error fetching friend requests:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map to expected format with user info
    const formattedRequests = await Promise.all((requests || []).map(async r => {
      const senderInfo = await getUserInfo(r.requester_id)
      return {
        id: r.id,
        sender_id: r.requester_id,
        sender_email: senderInfo?.email || '',
        sender_name: senderInfo?.name || 'Unknown User',
        sender_avatar_url: senderInfo?.avatar_url || null,
        created_at: r.created_at
      }
    }))

    return NextResponse.json({ data: formattedRequests })
  } catch (error) {
    console.error('Error in GET /api/friends/requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/friends/requests - Accept or decline a friend request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { request_id, action, user_id } = body

    if (!request_id || !action || !user_id) {
      return NextResponse.json(
        { error: 'request_id, action, and user_id are required' },
        { status: 400 }
      )
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'action must be "accept" or "decline"' }, { status: 400 })
    }

    // Get pending request (accepted_at is null)
    const { data: friendRequest, error: fetchError } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .eq('id', request_id)
      .eq('addressee_id', user_id) // Only addressee can accept/decline
      .is('accepted_at', null)
      .single()

    if (fetchError || !friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    if (action === 'accept') {
      const { error: updateError } = await supabaseAdmin
        .from('friendships')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', request_id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Friend request accepted!',
        status: 'accepted',
      })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('friendships')
      .delete()
      .eq('id', request_id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Friend request declined',
      status: 'declined',
    })
  } catch (error) {
    console.error('Error in POST /api/friends/requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
