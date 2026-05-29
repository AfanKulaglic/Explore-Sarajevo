import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deductTournamentEntryFee, getUserBalanceByEmail } from '@/lib/central-account'

/**
 * POST /api/tournaments/[id]/join - Join a tournament
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { account_id, account_email, team_id } = body

    if (!account_id || !account_email) {
      return NextResponse.json(
        { error: 'account_id and account_email are required' },
        { status: 400 }
      )
    }

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabaseAdmin
      .from('tournaments')
      .select(`
        *,
        participants:rewards_tournament_participants(count)
      `)
      .eq('id', id)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check if tournament is accepting participants
    if (tournament.status !== 'UPCOMING' && tournament.status !== 'LIVE') {
      return NextResponse.json(
        { error: 'Tournament is not accepting participants' },
        { status: 400 }
      )
    }

    // Check if tournament is full
    const currentParticipants = tournament.participants?.[0]?.count || 0
    if (currentParticipants >= tournament.max_participants) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 400 }
      )
    }

    // Check if user already joined
    const { data: existingParticipant } = await supabaseAdmin
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', id)
      .eq('account_id', account_id)
      .single()

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'You have already joined this tournament' },
        { status: 400 }
      )
    }

    // Check if entry fee needs to be paid
    if (tournament.entry_fee > 0) {
      const balance = await getUserBalanceByEmail(account_email)
      if (!balance) {
        return NextResponse.json(
          { error: 'Could not verify account balance' },
          { status: 400 }
        )
      }

      const userBalance = tournament.entry_currency === 'COINS' ? balance.coins : balance.tokens
      if (userBalance < tournament.entry_fee) {
        return NextResponse.json(
          { error: `Insufficient ${tournament.entry_currency.toLowerCase()} for entry fee` },
          { status: 400 }
        )
      }

      // Deduct entry fee
      const deductResult = await deductTournamentEntryFee(
        account_id,
        tournament.id,
        tournament.title,
        tournament.entry_fee,
        tournament.entry_currency
      )

      if (!deductResult.success) {
        return NextResponse.json(
          { error: 'Failed to process entry fee: ' + deductResult.error },
          { status: 500 }
        )
      }
    }

    // Create participant record
    const { data: participant, error } = await supabaseAdmin
      .from('tournament_participants')
      .insert({
        tournament_id: id,
        account_id,
        team_id,
        entry_paid: tournament.entry_fee > 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error joining tournament:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: participant }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tournaments/[id]/join:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
