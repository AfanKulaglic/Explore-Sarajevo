import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/achievements - Get all achievements
 * POST /api/achievements - Create a new achievement (admin only)
 * PATCH /api/achievements?id= - Update an achievement (admin only)
 * DELETE /api/achievements?id= - Delete an achievement (admin only)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabaseAdmin
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: achievements, error } = await query

    if (error) {
      console.error('Error fetching achievements:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: achievements })
  } catch (error) {
    console.error('Error in GET /api/achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json()
    
    const {
      slug,
      name,
      description,
      icon,
      category,
      xp_reward = 0,
      coins_reward = 0,
      tokens_reward = 0,
      requirement_type,
      requirement_value = 0,
      is_hidden = false,
      is_active = true,
      // Bosnian translations
      title_bosnian,
      description_bosnian
    } = body

    if (!slug || !name || !category) {
      return NextResponse.json(
        { error: 'slug, name, and category are required' },
        { status: 400 }
      )
    }

    const { data: achievement, error } = await supabaseAdmin
      .from('achievements')
      .insert({
        slug,
        name,
        description,
        icon,
        category,
        xp_reward,
        coins_reward,
        tokens_reward,
        requirement_type,
        requirement_value,
        is_hidden,
        is_active,
        title_bosnian,
        description_bosnian
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An achievement with this slug already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: achievement }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      slug,
      name,
      description,
      icon,
      category,
      xp_reward,
      coins_reward,
      tokens_reward,
      requirement_type,
      requirement_value,
      is_hidden,
      is_active,
      // Bosnian translations
      title_bosnian,
      description_bosnian
    } = body

    const updates: Record<string, any> = {}
    if (slug !== undefined) updates.slug = slug
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (icon !== undefined) updates.icon = icon
    if (category !== undefined) updates.category = category
    if (xp_reward !== undefined) updates.xp_reward = xp_reward
    if (coins_reward !== undefined) updates.coins_reward = coins_reward
    if (tokens_reward !== undefined) updates.tokens_reward = tokens_reward
    if (requirement_type !== undefined) updates.requirement_type = requirement_type
    if (requirement_value !== undefined) updates.requirement_value = requirement_value
    if (is_hidden !== undefined) updates.is_hidden = is_hidden
    if (is_active !== undefined) updates.is_active = is_active
    // Bosnian translations
    if (title_bosnian !== undefined) updates.title_bosnian = title_bosnian
    if (description_bosnian !== undefined) updates.description_bosnian = description_bosnian

    const { data: achievement, error } = await supabaseAdmin
      .from('achievements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An achievement with this slug already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: achievement })
  } catch (error) {
    console.error('Error in PATCH /api/achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    // First delete any user_achievements referencing this
    await supabaseAdmin
      .from('user_achievements')
      .delete()
      .eq('achievement_id', id)

    // Then delete the achievement
    const { error } = await supabaseAdmin
      .from('achievements')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
