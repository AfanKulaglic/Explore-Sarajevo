import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

const SOCIAL_REWARDS: Record<string, number> = {
  youtube: 2000,
  instagram: 2000,
  facebook: 2000,
  tiktok: 2000,
}

// Add coins to account using admin API
async function addCoinsToAccount(accountId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': ADMIN_EMAIL
      },
      body: JSON.stringify({
        balanceDelta: amount // Positive to add coins
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to add coins:', errorText)
      return { success: false, error: 'Failed to add coins' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding coins:', error)
    return { success: false, error: 'Network error while adding coins' }
  }
}

/**
 * GET /api/social-follow - Get user's claimed social follows
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 })
    }

    // Get all claimed social follows for this user
    const { data: claims, error } = await supabaseAdmin
      .from('social_follows')
      .select('platform')
      .eq('account_id', accountId)

    if (error) {
      // Table might not exist yet, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ data: [] })
      }
      console.error('Error fetching social follows:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const claimedPlatforms = claims?.map(c => c.platform) || []
    return NextResponse.json({ data: claimedPlatforms })
  } catch (error) {
    console.error('Error in GET /api/social-follow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/social-follow - Claim social follow reward
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account_id, platform } = body

    if (!account_id || !platform) {
      return NextResponse.json(
        { error: 'account_id and platform are required' },
        { status: 400 }
      )
    }

    // Validate platform
    const reward = SOCIAL_REWARDS[platform.toLowerCase()]
    if (!reward) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    // Check if already claimed
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('social_follows')
      .select('id')
      .eq('account_id', account_id)
      .eq('platform', platform.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already claimed reward for this platform' },
        { status: 400 }
      )
    }

    // Record the claim in database
    const { error: insertError } = await supabaseAdmin
      .from('social_follows')
      .insert({
        account_id,
        platform: platform.toLowerCase(),
        coins_awarded: reward,
        claimed_at: new Date().toISOString()
      })

    if (insertError) {
      // If table doesn't exist, create it
      if (insertError.code === '42P01') {
        // Table doesn't exist - we need to create it
        // For now, just proceed without tracking (but award coins)
        console.warn('social_follows table does not exist, awarding coins without tracking')
      } else {
        console.error('Error inserting social follow:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    // Award coins via central account system (using admin API)
    const result = await addCoinsToAccount(account_id, reward)

    if (!result.success) {
      // Rollback the claim if coin award failed
      await supabaseAdmin
        .from('social_follows')
        .delete()
        .eq('account_id', account_id)
        .eq('platform', platform.toLowerCase())

      return NextResponse.json(
        { error: result.error || 'Failed to award coins' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `You earned ${reward} coins for following on ${platform}!`,
      coins: reward,
      xp: 50
    })
  } catch (error) {
    console.error('Error in POST /api/social-follow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
