import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { awardTournamentPrize } from '@/lib/central-account'

/**
 * GET /api/tournaments/[id] - Get a single tournament with details
 * PATCH /api/tournaments/[id] - Update tournament (admin only)
 * DELETE /api/tournaments/[id] - Delete tournament (admin only)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: tournament, error } = await supabaseAdmin
      .from('tournaments')
      .select(`
        *,
        prizes:rewards_tournament_prizes(*),
        participants:rewards_tournament_participants(
          *
        ),
        teams:rewards_tournament_teams(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: tournament })
  } catch (error) {
    console.error('Error in GET /api/tournaments/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // TODO: Add admin authentication check
    const body = await request.json()
    
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    const allowedFields = [
      'title', 'description', 'image_url', 'type', 'status',
      'start_date', 'end_date', 'entry_fee', 'entry_currency',
      'max_participants', 'team_size', 'rules', 'xp_reward', 'featured',
      // Bosnian translations
      'title_bosnian', 'description_bosnian', 'rules_bosnian'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // If status is changing to COMPLETED, handle prize distribution
    if (body.status === 'COMPLETED') {
      const { data: tournamentData } = await supabaseAdmin
        .from('tournaments')
        .select(`
          *,
          prizes:rewards_tournament_prizes(*),
          participants:rewards_tournament_participants(*)
        `)
        .eq('id', id)
        .single()

      if (tournamentData && tournamentData.participants) {
        // Sort participants by score (descending) and rank
        const rankedParticipants = tournamentData.participants
          .filter((p: any) => !p.eliminated_at)
          .sort((a: any, b: any) => b.score - a.score)

        // Award prizes to top participants
        for (let i = 0; i < rankedParticipants.length; i++) {
          const participant = rankedParticipants[i]
          const place = i + 1
          const prize = tournamentData.prizes?.find((p: any) => p.place === place)

          if (prize && !participant.prize_claimed) {
            // Award the prize via Account-System
            await awardTournamentPrize(
              participant.account_id,
              tournamentData.id,
              tournamentData.title,
              place,
              prize.coins || 0,
              prize.tokens || 0,
              prize.xp || 0
            )

            // Mark prize as claimed
            await supabaseAdmin
              .from('tournament_participants')
              .update({ prize_claimed: true, rank: place })
              .eq('id', participant.id)
          }
        }
      }
    }

    const { data: tournament, error } = await supabaseAdmin
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: tournament })
  } catch (error) {
    console.error('Error in PATCH /api/tournaments/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // TODO: Add admin authentication check
    // Check if tournament has participants
    const { data: participants } = await supabaseAdmin
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', id)
      .limit(1)

    if (participants && participants.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tournament with participants. Cancel it instead.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('tournaments')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Tournament deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/tournaments/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
