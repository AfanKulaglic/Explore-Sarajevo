import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

/**
 * POST /api/tournaments/[id]/leave - Leave a tournament (only before it starts)
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { account_id } = body

    if (!account_id) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      )
    }

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabaseAdmin
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Only allow leaving UPCOMING tournaments
    if (tournament.status !== 'UPCOMING') {
      return NextResponse.json(
        { error: 'You can only leave tournaments that have not started yet' },
        { status: 400 }
      )
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabaseAdmin
      .from('tournament_participants')
      .select('id, entry_paid')
      .eq('tournament_id', id)
      .eq('account_id', account_id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this tournament' },
        { status: 400 }
      )
    }

    // Refund entry fee if paid
    if (participant.entry_paid && tournament.entry_fee > 0) {
      const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${account_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': ADMIN_EMAIL
        },
        body: JSON.stringify({
          balanceDelta: tournament.entry_fee // Refund coins
        })
      })

      if (!response.ok) {
        console.error('Failed to refund entry fee')
        // Continue anyway - we'll remove them from the tournament
      }
    }

    // Remove participant
    const { error: deleteError } = await supabaseAdmin
      .from('tournament_participants')
      .delete()
      .eq('id', participant.id)

    if (deleteError) {
      console.error('Error leaving tournament:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully left the tournament',
      refunded: participant.entry_paid && tournament.entry_fee > 0
    })
  } catch (error) {
    console.error('Error in POST /api/tournaments/[id]/leave:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
