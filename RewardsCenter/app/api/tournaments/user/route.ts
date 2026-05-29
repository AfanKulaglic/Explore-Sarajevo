import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/tournaments/user - Get user's tournament participations and stats
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 })
    }

    // Get all participations with tournament details
    const { data: participations, error } = await supabaseAdmin
      .from('tournament_participants')
      .select(`
        id,
        tournament_id,
        score,
        rank,
        joined_at,
        eliminated_at,
        prize_claimed,
        tournament:rewards_tournaments(
          id,
          title,
          description,
          image_url,
          type,
          status,
          start_date,
          end_date,
          entry_fee,
          entry_currency,
          max_participants,
          xp_reward,
          featured,
          rules,
          prizes:rewards_tournament_prizes(*)
        )
      `)
      .eq('account_id', accountId)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching user tournaments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get participant counts for each tournament
    const tournamentIds = participations?.map(p => p.tournament_id) || []
    
    let participantCounts: Record<string, number> = {}
    if (tournamentIds.length > 0) {
      const { data: counts } = await supabaseAdmin
        .from('tournament_participants')
        .select('tournament_id')
        .in('tournament_id', tournamentIds)
      
      if (counts) {
        counts.forEach((c: any) => {
          participantCounts[c.tournament_id] = (participantCounts[c.tournament_id] || 0) + 1
        })
      }
    }

    // Calculate stats
    const active = participations?.filter(p => {
      const t = p.tournament as any
      return t?.status === 'UPCOMING' || t?.status === 'LIVE'
    }).length || 0

    const won = participations?.filter(p => p.rank === 1).length || 0

    // Calculate total earnings from claimed prizes
    let totalEarnings = 0
    participations?.forEach(p => {
      if (p.prize_claimed && p.rank) {
        const t = p.tournament as any
        const prize = t?.prizes?.find((pr: any) => pr.place === p.rank)
        if (prize) {
          totalEarnings += prize.coins || 0
        }
      }
    })

    // Transform participations
    const transformedParticipations = participations?.map(p => {
      const t = p.tournament as any
      return {
        id: p.id,
        tournamentId: p.tournament_id,
        tournament: {
          id: t.id,
          title: t.title,
          description: t.description,
          imageUrl: t.image_url,
          type: t.type,
          status: t.status,
          startDate: t.start_date,
          endDate: t.end_date,
          entryFee: t.entry_fee,
          entryCurrency: t.entry_currency,
          maxParticipants: t.max_participants,
          currentParticipants: participantCounts[t.id] || 0,
          xpReward: t.xp_reward,
          featured: t.featured,
          rules: t.rules || [],
          prizes: t.prizes?.map((pr: any) => ({
            place: pr.place,
            coins: pr.coins || 0,
            xp: pr.xp || 0,
            tokens: pr.tokens || 0,
            badge: pr.badge,
          })) || [],
          topParticipants: [],
        },
        score: p.score,
        rank: p.rank,
        joinedAt: p.joined_at,
        eliminatedAt: p.eliminated_at,
        prizeClaimed: p.prize_claimed,
      }
    }) || []

    return NextResponse.json({
      active,
      won,
      totalEarnings,
      participations: transformedParticipations,
    })
  } catch (error) {
    console.error('Error in GET /api/tournaments/user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
