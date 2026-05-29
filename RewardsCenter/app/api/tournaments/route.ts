import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/tournaments - Get all tournaments
 * POST /api/tournaments - Create a new tournament (admin only)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('tournaments')
      .select(`
        *,
        prizes:rewards_tournament_prizes(*),
        participants:rewards_tournament_participants(count)
      `, { count: 'exact' })
      .order('start_date', { ascending: true })

    if (status && status !== 'ALL') {
      query = query.eq('status', status)
    }

    if (type && type !== 'ALL') {
      query = query.eq('type', type)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: tournaments, error, count } = await query

    if (error) {
      console.error('Error fetching tournaments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to include participant count
    const transformedTournaments = tournaments?.map((t: any) => ({
      ...t,
      current_participants: t.participants?.[0]?.count || 0
    }))

    return NextResponse.json({ 
      data: transformedTournaments,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error in GET /api/tournaments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json()
    
    const {
      title,
      description,
      image_url,
      type = 'SOLO',
      start_date,
      end_date,
      entry_fee = 0,
      entry_currency = 'COINS',
      max_participants,
      team_size = 1,
      rules = [],
      xp_reward = 0,
      featured = false,
      created_by,
      prizes = [],
      // Bosnian translations
      title_bosnian,
      description_bosnian,
      rules_bosnian = []
    } = body

    if (!title || !start_date || !end_date || !max_participants) {
      return NextResponse.json(
        { error: 'title, start_date, end_date, and max_participants are required' },
        { status: 400 }
      )
    }

    // Create tournament
    const { data: tournament, error } = await supabaseAdmin
      .from('tournaments')
      .insert({
        title,
        description,
        image_url,
        type,
        status: 'UPCOMING',
        start_date,
        end_date,
        entry_fee,
        entry_currency,
        max_participants,
        team_size,
        rules,
        xp_reward,
        featured,
        created_by,
        title_bosnian,
        description_bosnian,
        rules_bosnian
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tournament:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create prizes if provided
    if (prizes.length > 0) {
      const prizeRecords = prizes.map((prize: any) => ({
        tournament_id: tournament.id,
        place: prize.place,
        coins: prize.coins || 0,
        xp: prize.xp || 0,
        tokens: prize.tokens || 0,
        badge: prize.badge,
        reward_id: prize.reward_id
      }))

      const { error: prizeError } = await supabaseAdmin
        .from('tournament_prizes')
        .insert(prizeRecords)

      if (prizeError) {
        console.error('Error creating prizes:', prizeError)
        // Tournament was created, just log the prize error
      }
    }

    return NextResponse.json({ data: tournament }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tournaments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
