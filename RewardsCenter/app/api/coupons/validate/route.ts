import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Validate and apply a coupon code
 * POST /api/coupons/validate
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, account_id, reward_id, order_total } = body

    if (!code || !account_id) {
      return NextResponse.json(
        { error: 'code and account_id are required' },
        { status: 400 }
      )
    }

    // Get coupon
    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    // Check if coupon has started
    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return NextResponse.json(
        { error: 'This coupon is not yet active' },
        { status: 400 }
      )
    }

    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      )
    }

    // Check max uses
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'This coupon has reached its maximum uses' },
        { status: 400 }
      )
    }

    // Check user usage limit
    const { data: userUses } = await supabaseAdmin
      .from('coupon_uses')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('account_id', account_id)

    if (userUses && userUses.length >= (coupon.max_uses_per_user || 1)) {
      return NextResponse.json(
        { error: 'You have already used this coupon the maximum number of times' },
        { status: 400 }
      )
    }

    // Check minimum order value
    if (order_total && coupon.min_order_value && order_total < coupon.min_order_value) {
      return NextResponse.json(
        { error: `Minimum order value of ${coupon.min_order_value} required` },
        { status: 400 }
      )
    }

    // Check if coupon is applicable to this reward
    if (coupon.applicable_reward_ids && coupon.applicable_reward_ids.length > 0) {
      if (reward_id && !coupon.applicable_reward_ids.includes(reward_id)) {
        return NextResponse.json(
          { error: 'This coupon is not valid for this reward' },
          { status: 400 }
        )
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (order_total) {
      if (coupon.discount_type === 'PERCENTAGE') {
        discountAmount = Math.floor(order_total * (coupon.discount_value / 100))
      } else {
        discountAmount = Math.min(coupon.discount_value, order_total)
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount
      }
    })
  } catch (error) {
    console.error('Error in POST /api/coupons/validate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
