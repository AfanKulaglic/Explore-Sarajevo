import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { recordPlatformActivity } from '@/lib/central-account'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

// Add coins/tokens/xp to account using admin API
async function addToAccount(
  accountId: string, 
  coins: number = 0, 
  tokens: number = 0, 
  xp: number = 0
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use PATCH for coins (balanceDelta)
    if (coins > 0) {
      const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': ADMIN_EMAIL
        },
        body: JSON.stringify({
          balanceDelta: coins
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to add coins:', errorText)
        return { success: false, error: 'Failed to add coins' }
      }
    }

    // Use PATCH for tokens (tokensDelta)
    if (tokens > 0) {
      const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': ADMIN_EMAIL
        },
        body: JSON.stringify({
          tokensDelta: tokens
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to add tokens:', errorText)
        return { success: false, error: 'Failed to add tokens' }
      }
    }

    // Use PATCH for XP (xpDelta)
    if (xp > 0) {
      const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': ADMIN_EMAIL
        },
        body: JSON.stringify({
          xpDelta: xp
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to add XP:', errorText)
        return { success: false, error: 'Failed to add XP' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding to account:', error)
    return { success: false, error: 'Network error while updating account' }
  }
}

/**
 * Redeem a promo code for coins/xp/tokens
 * POST /api/coupons/redeem
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, account_id } = body

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

    // Check if this is a redeemable promo code (gives coins/xp/tokens)
    const redeemableTypes = ['COINS_REWARD', 'XP_REWARD', 'TOKENS_REWARD', 'FIXED_COINS', 'FIXED_TOKENS']
    if (!redeemableTypes.includes(coupon.discount_type)) {
      return NextResponse.json(
        { error: 'This coupon can only be used during checkout' },
        { status: 400 }
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
        { error: 'You have already redeemed this code' },
        { status: 400 }
      )
    }

    // Determine what to award
    let coinsToAdd = 0
    let xpToAdd = 0
    let tokensToAdd = 0

    switch (coupon.discount_type) {
      case 'COINS_REWARD':
      case 'FIXED_COINS':
        coinsToAdd = coupon.discount_value
        break
      case 'XP_REWARD':
        xpToAdd = coupon.discount_value
        break
      case 'TOKENS_REWARD':
      case 'FIXED_TOKENS':
        tokensToAdd = coupon.discount_value
        break
    }

    // Award coins/tokens/xp via central API
    const result = await addToAccount(account_id, coinsToAdd, tokensToAdd, xpToAdd)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to apply rewards to your account' },
        { status: 500 }
      )
    }

    // Record the coupon use
    await supabaseAdmin
      .from('coupon_uses')
      .insert({
        coupon_id: coupon.id,
        account_id: account_id,
      })

    // Increment usage count
    await supabaseAdmin
      .from('coupons')
      .update({ uses_count: coupon.uses_count + 1 })
      .eq('id', coupon.id)

    // Create notification
    let notificationTitle = 'Promo Code Redeemed!'
    let notificationBody = ''
    let notificationType: 'COINS' | 'REWARD' | 'PROMO' = 'PROMO'

    if (coinsToAdd > 0) {
      notificationBody = `You received ${coinsToAdd.toLocaleString()} coins from promo code ${coupon.code}!`
      notificationType = 'COINS'
    } else if (xpToAdd > 0) {
      notificationBody = `You received ${xpToAdd.toLocaleString()} XP from promo code ${coupon.code}!`
    } else if (tokensToAdd > 0) {
      notificationBody = `You received ${tokensToAdd.toLocaleString()} tokens from promo code ${coupon.code}!`
      notificationType = 'REWARD'
    }

    await supabaseAdmin
      .from('notifications')
      .insert({
        account_id,
        type: notificationType,
        title: notificationTitle,
        body: notificationBody,
        data: {
          coupon_code: coupon.code,
          coins_awarded: coinsToAdd,
          xp_awarded: xpToAdd,
          tokens_awarded: tokensToAdd,
        }
      })

    return NextResponse.json({
      success: true,
      message: notificationBody,
      rewards: {
        coins: coinsToAdd,
        xp: xpToAdd,
        tokens: tokensToAdd,
      }
    })
  } catch (error) {
    console.error('Error in POST /api/coupons/redeem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
