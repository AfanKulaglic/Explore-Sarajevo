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

// Helper to get user info from central system
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
 * GET /api/friends - Get user's friends list
 * POST /api/friends - Send a friend request
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Accepted friendships have accepted_at set
    const { data: friendships, error } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .not('accepted_at', 'is', null)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order('accepted_at', { ascending: false })

    if (error) {
      console.error('Error fetching friends:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get friend info from central system
    const friends = await Promise.all((friendships || []).map(async f => {
      const isRequester = f.requester_id === userId
      const friendId = isRequester ? f.addressee_id : f.requester_id
      const friendInfo = await getUserInfo(friendId)
      
      return {
        id: f.id,
        friendId,
        email: friendInfo?.email || '',
        name: friendInfo?.name || 'Unknown User',
        avatarUrl: friendInfo?.avatar_url || null,
        friendsSince: f.accepted_at || f.created_at,
      }
    }))

    return NextResponse.json({ data: friends })
  } catch (error) {
    console.error('Error in GET /api/friends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sender_id, 
      receiver_id, 
    } = body

    if (!sender_id || !receiver_id) {
      return NextResponse.json(
        { error: 'sender_id and receiver_id are required' },
        { status: 400 }
      )
    }

    // Check if there's already a friendship (any status)
    const { data: existingFriendship } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .or(`and(requester_id.eq.${sender_id},addressee_id.eq.${receiver_id}),and(requester_id.eq.${receiver_id},addressee_id.eq.${sender_id})`)
      .single()

    if (existingFriendship) {
      if (existingFriendship.accepted_at) {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 })
      }
      
      // If the other user already sent a request, auto-accept
      if (existingFriendship.requester_id === receiver_id) {
        const { error: updateError } = await supabaseAdmin
          .from('friendships')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', existingFriendship.id)

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ 
          message: 'Friend request accepted - you are now friends!',
          status: 'accepted'
        })
      }
      
      return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 })
    }

    // Create new friend request (accepted_at null until accepted)
    const { data: friendRequest, error } = await supabaseAdmin
      .from('friendships')
      .insert({
        requester_id: sender_id,
        addressee_id: receiver_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating friend request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Friend request sent',
      data: friendRequest 
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/friends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
