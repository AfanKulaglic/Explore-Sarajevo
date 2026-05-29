import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { refundCoinsForOrder } from '@/lib/central-account'

/**
 * GET /api/orders/[id] - Get a single order
 * PATCH /api/orders/[id] - Update order status (admin only)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: order, error } = await supabaseAdmin
      .from('reward_orders')
      .select(`
        *,
        reward:rewards(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: order })
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error)
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
    
    const { status, notes, denied_reason, approved_by } = body

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('reward_orders')
      .select(`
        *,
        reward:rewards(title)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    if (status) {
      updates.status = status

      // Handle status-specific logic
      if (status === 'APPROVED') {
        updates.approved_at = new Date().toISOString()
        if (approved_by) updates.approved_by = approved_by
      } else if (status === 'FULFILLED') {
        updates.fulfilled_at = new Date().toISOString()
      } else if (status === 'DENIED' || status === 'CANCELLED') {
        if (denied_reason) updates.denied_reason = denied_reason

        // Refund the user if order was previously pending or approved
        if (['PENDING', 'APPROVED'].includes(currentOrder.status)) {
          const refundResult = await refundCoinsForOrder(
            currentOrder.account_id,
            currentOrder.reward_id,
            currentOrder.reward?.title || 'Unknown Reward',
            currentOrder.total_price,
            id,
            denied_reason || 'Order cancelled'
          )

          if (!refundResult.success) {
            console.error('Failed to refund order:', refundResult.error)
            // Continue anyway, but log the error
          }

          // Restore stock if applicable
          const { data: reward } = await supabaseAdmin
            .from('rewards')
            .select('stock')
            .eq('id', currentOrder.reward_id)
            .single()

          if (reward && reward.stock !== null) {
            await supabaseAdmin
              .from('rewards')
              .update({ stock: reward.stock + currentOrder.quantity })
              .eq('id', currentOrder.reward_id)
          }
        }
      }
    }

    if (notes !== undefined) updates.notes = notes

    const { data: order, error } = await supabaseAdmin
      .from('reward_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: order })
  } catch (error) {
    console.error('Error in PATCH /api/orders/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
