import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deductCoinsForRedemption, deductTokensForRedemption, getUserBalanceByEmail } from '@/lib/central-account'

/**
 * GET /api/orders - Get orders (filtered by account_id for users, all for admin)
 * POST /api/orders - Create a new order (redemption)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('reward_orders')
      .select(`
        *,
        reward:rewards(id, title, image_url, type, category)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (accountId) {
      query = query.eq('account_id', accountId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      data: orders,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error in GET /api/orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      account_id,
      account_email,
      reward_id,
      quantity = 1,
      shipping_address
    } = body

    if (!account_id || !account_email || !reward_id) {
      return NextResponse.json(
        { error: 'account_id, account_email, and reward_id are required' },
        { status: 400 }
      )
    }

    // Get the reward details
    const { data: reward, error: rewardError } = await supabaseAdmin
      .from('rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('is_active', true)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json(
        { error: 'Reward not found or not available' },
        { status: 404 }
      )
    }

    // Check stock
    if (reward.stock !== null && reward.stock < quantity) {
      return NextResponse.json(
        { error: 'Not enough stock available' },
        { status: 400 }
      )
    }

    // Check user balance from Account-System using email
    const balance = await getUserBalanceByEmail(account_email)
    if (!balance) {
      return NextResponse.json(
        { error: 'Could not verify account balance' },
        { status: 400 }
      )
    }

    const totalPrice = reward.price * quantity
    const userBalance = reward.currency === 'COINS' ? balance.coins : balance.tokens

    if (userBalance < totalPrice) {
      return NextResponse.json(
        { error: `Insufficient ${reward.currency.toLowerCase()}. You have ${userBalance}, need ${totalPrice}` },
        { status: 400 }
      )
    }

    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('reward_orders')
      .insert({
        account_id,
        account_email,
        reward_id,
        quantity,
        unit_price: reward.price,
        total_price: totalPrice,
        currency: reward.currency,
        status: reward.requires_approval ? 'PENDING' : 'APPROVED',
        shipping_address: reward.type === 'PHYSICAL' ? shipping_address : null
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Deduct currency from Account-System
    const deductResult = reward.currency === 'COINS'
      ? await deductCoinsForRedemption(account_id, reward_id, reward.title, totalPrice, order.id)
      : await deductTokensForRedemption(account_id, reward_id, reward.title, totalPrice, order.id)

    if (!deductResult.success) {
      // Rollback the order
      await supabaseAdmin
        .from('reward_orders')
        .delete()
        .eq('id', order.id)

      return NextResponse.json(
        { error: 'Failed to process payment: ' + deductResult.error },
        { status: 500 }
      )
    }

    // Update stock if limited
    if (reward.stock !== null) {
      await supabaseAdmin
        .from('rewards')
        .update({ stock: reward.stock - quantity })
        .eq('id', reward_id)
    }

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
