import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/tournaments/[id]/participation - Check if user is a participant
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      )
    }

    // Check if user is a participant
    const { data: participant, error } = await supabaseAdmin
      .from('tournament_participants')
      .select('id, score, rank, joined_at')
      .eq('tournament_id', id)
      .eq('account_id', accountId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Error checking participation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      isParticipant: !!participant,
      participation: participant || null
    })
  } catch (error) {
    console.error('Error in GET /api/tournaments/[id]/participation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
