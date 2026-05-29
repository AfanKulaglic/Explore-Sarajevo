import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/rewards - Get all active rewards
 * POST /api/rewards - Create a new reward (admin only)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const currency = searchParams.get('currency')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('rewards')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (currency && currency !== 'all') {
      query = query.eq('currency', currency)
    }

    if (featured === 'true') {
      query = query.contains('tags', ['FEATURED'])
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: rewards, error, count } = await query

    if (error) {
      console.error('Error fetching rewards:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      data: rewards,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error in GET /api/rewards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json()
    
    const {
      title,
      subtitle,
      description,
      image_url,
      type = 'PHYSICAL',
      category,
      price,
      currency = 'COINS',
      stock,
      requires_approval = false,
      tags = [],
      expires_at,
      // Bosnian translations
      title_bosnian,
      subtitle_bosnian,
      description_bosnian
    } = body

    if (!title || !category || price === undefined) {
      return NextResponse.json(
        { error: 'title, category, and price are required' },
        { status: 400 }
      )
    }

    const { data: reward, error } = await supabaseAdmin
      .from('rewards')
      .insert({
        title,
        subtitle,
        description,
        image_url,
        type,
        category,
        price,
        currency,
        stock,
        requires_approval,
        tags,
        expires_at,
        is_active: true,
        title_bosnian,
        subtitle_bosnian,
        description_bosnian
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reward:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: reward }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/rewards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
