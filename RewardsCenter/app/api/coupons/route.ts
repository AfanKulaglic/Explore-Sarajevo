import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/coupons - Get all active coupons
 * POST /api/coupons - Create a new coupon (admin only)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true' // For admin view

    let query = supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (!showAll) {
      query = query
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    }

    const { data: coupons, error } = await query

    if (error) {
      console.error('Error fetching coupons:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: coupons })
  } catch (error) {
    console.error('Error in GET /api/coupons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json()
    
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_value = 0,
      max_uses,
      max_uses_per_user = 1,
      applicable_reward_ids,
      applicable_categories,
      starts_at,
      expires_at,
      created_by
    } = body

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json(
        { error: 'code, discount_type, and discount_value are required' },
        { status: 400 }
      )
    }

    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        min_order_value,
        max_uses,
        max_uses_per_user,
        applicable_reward_ids,
        applicable_categories,
        starts_at,
        expires_at,
        is_active: true,
        created_by
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A coupon with this code already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: coupon }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/coupons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
