import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/rewards/[id] - Get a single reward
 * PATCH /api/rewards/[id] - Update a reward (admin only)
 * DELETE /api/rewards/[id] - Delete a reward (admin only)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: reward, error } = await supabaseAdmin
      .from('rewards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: reward })
  } catch (error) {
    console.error('Error in GET /api/rewards/[id]:', error)
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
    
    const updates: Record<string, any> = {}
    const allowedFields = [
      'title', 'subtitle', 'description', 'image_url', 'type',
      'category', 'price', 'currency', 'stock', 'requires_approval',
      'tags', 'expires_at', 'is_active',
      // Bosnian translations
      'title_bosnian', 'subtitle_bosnian', 'description_bosnian'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    updates.updated_at = new Date().toISOString()

    const { data: reward, error } = await supabaseAdmin
      .from('rewards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: reward })
  } catch (error) {
    console.error('Error in PATCH /api/rewards/[id]:', error)
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
    // Soft delete by setting is_active to false
    const { data: reward, error } = await supabaseAdmin
      .from('rewards')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: reward, message: 'Reward deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/rewards/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
