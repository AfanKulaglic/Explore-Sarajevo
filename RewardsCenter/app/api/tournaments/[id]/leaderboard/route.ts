import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'https://accounts.saraya.solutions'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

/**
 * GET /api/tournaments/[id]/leaderboard - Get tournament leaderboard
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabaseAdmin
      .from('tournaments')
      .select('id, title, status, start_date, end_date')
      .eq('id', id)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Get participants with scores
    const { data: participants, error, count } = await supabaseAdmin
      .from('tournament_participants')
      .select('id, account_id, score, rank, joined_at, eliminated_at', { count: 'exact' })
      .eq('tournament_id', id)
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get account details from central API for each participant
    const accountIds = participants?.map(p => p.account_id) || []
    
    let accountsMap: Record<string, { name: string; avatar_url: string | null }> = {}
    
    if (accountIds.length > 0) {
      try {
        // Fetch all accounts and filter by IDs
        const response = await fetch(`${CENTRAL_API_URL}/api/accounts?limit=1000`, {
          headers: {
            'Content-Type': 'application/json',
            'x-admin-email': ADMIN_EMAIL
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const accounts = data.data || data.accounts || []
          accounts.forEach((acc: any) => {
            if (accountIds.includes(acc.id)) {
              accountsMap[acc.id] = {
                name: acc.name || acc.email?.split('@')[0] || 'Anonymous',
                avatar_url: acc.avatar_url
              }
            }
          })
        }
      } catch (err) {
        console.error('Error fetching account details:', err)
        // Continue without account details
      }
    }

    // Transform participants with account info and calculate ranks
    const leaderboard = participants?.map((p, index) => ({
      id: p.id,
      rank: offset + index + 1,
      accountId: p.account_id,
      name: accountsMap[p.account_id]?.name || 'Anonymous',
      avatarUrl: accountsMap[p.account_id]?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.account_id}`,
      score: p.score || 0,
      joinedAt: p.joined_at,
      eliminated: !!p.eliminated_at,
    })) || []

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        title: tournament.title,
        status: tournament.status,
      },
      leaderboard,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error in GET /api/tournaments/[id]/leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
