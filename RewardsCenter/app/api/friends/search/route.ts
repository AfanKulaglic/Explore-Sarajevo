import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { asAccountRecord, getAccountBalance } from '@/lib/account-api'

/**
 * GET /api/friends/search - Search for users to send friend requests
 * Searches the central Account System for users
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const currentUserId = searchParams.get('user_id')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    if (!currentUserId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Search the central account system
    const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
    const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

    const response = await fetch(
      `${CENTRAL_API_URL}/api/accounts?search=${encodeURIComponent(query)}&limit=20`,
      {
        headers: {
          'x-admin-email': ADMIN_EMAIL
        }
      }
    )

    if (!response.ok) {
      console.error('Error searching accounts:', await response.text())
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    const result = await response.json()
    const accounts = result.data || []

    // Filter out the current user
    const filteredAccounts = accounts.filter((a: any) => a.id !== currentUserId)

    // Get existing friendships for current user (using existing schema)
    const { data: friendships } = await supabaseAdmin
      .from('friendships')
      .select('requester_id, addressee_id, accepted_at')
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)

    const friendIds = new Set<string>()
    const pendingIds = new Set<string>()
    
    friendships?.forEach(f => {
      const otherId = f.requester_id === currentUserId ? f.addressee_id : f.requester_id
      if (f.accepted_at) {
        friendIds.add(otherId)
      } else {
        pendingIds.add(otherId)
      }
    })

    // Map accounts to search results with relationship status
    const users = filteredAccounts.map((account: any) => ({
      id: account.id,
      email: account.email,
      name: account.name,
      avatarUrl: account.avatar_url,
      level: getAccountBalance(asAccountRecord(account)).level,
      isFriend: friendIds.has(account.id),
      isPending: pendingIds.has(account.id),
    }))

    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('Error in GET /api/friends/search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
