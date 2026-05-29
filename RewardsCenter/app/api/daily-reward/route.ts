import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

const DAILY_REWARD_COINS = 1000

// Get current date in CET (Central European Time) as YYYY-MM-DD
function getTodayCET(): string {
  const now = new Date()
  // CET is UTC+1, CEST is UTC+2. For simplicity, use Europe/Berlin timezone
  const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  const year = cetDate.getFullYear()
  const month = String(cetDate.getMonth() + 1).padStart(2, '0')
  const day = String(cetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get yesterday's date in CET as YYYY-MM-DD
function getYesterdayCET(): string {
  const now = new Date()
  const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  cetDate.setDate(cetDate.getDate() - 1)
  const year = cetDate.getFullYear()
  const month = String(cetDate.getMonth() + 1).padStart(2, '0')
  const day = String(cetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get milliseconds until midnight CET
function getMillisUntilMidnightCET(): number {
  const now = new Date()
  // Get current time in CET
  const cetNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  // Create midnight CET for tomorrow
  const midnightCET = new Date(cetNow)
  midnightCET.setDate(midnightCET.getDate() + 1)
  midnightCET.setHours(0, 0, 0, 0)
  
  // Calculate difference
  const cetNowMs = cetNow.getTime()
  const midnightMs = midnightCET.getTime()
  return midnightMs - cetNowMs
}

// Calculate the current streak for a user
async function calculateStreak(accountId: string): Promise<number> {
  // Get all claims for this user, ordered by date descending
  const { data: claims, error } = await supabaseAdmin
    .from('daily_rewards')
    .select('claim_date')
    .eq('account_id', accountId)
    .order('claim_date', { ascending: false })
    .limit(100) // Reasonable limit

  if (error || !claims || claims.length === 0) {
    return 0
  }

  const todayCET = getTodayCET()
  const yesterdayCET = getYesterdayCET()
  
  // Check if user claimed today or yesterday (streak continues if they claimed yesterday but not today yet)
  const firstClaim = claims[0].claim_date
  if (firstClaim !== todayCET && firstClaim !== yesterdayCET) {
    // Streak is broken - last claim was more than 1 day ago
    return 0
  }

  // Count consecutive days
  let streak = 0
  let expectedDate = firstClaim === todayCET ? todayCET : yesterdayCET
  
  for (const claim of claims) {
    if (claim.claim_date === expectedDate) {
      streak++
      // Calculate previous day
      const date = new Date(expectedDate + 'T12:00:00Z') // Use noon to avoid timezone issues
      date.setDate(date.getDate() - 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      expectedDate = `${year}-${month}-${day}`
    } else if (claim.claim_date < expectedDate) {
      // Gap found, streak ends
      break
    }
    // If claim_date > expectedDate, skip (duplicate or future date somehow)
  }

  return streak
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
        balanceDelta: amount
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
 * GET /api/daily-reward - Check if user can claim daily reward
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 })
    }

    const todayCET = getTodayCET()

    // Check if already claimed today
    const { data: claim, error } = await supabaseAdmin
      .from('daily_rewards')
      .select('id, claimed_at')
      .eq('account_id', accountId)
      .eq('claim_date', todayCET)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      console.error('Error checking daily reward:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const canClaim = !claim
    const msUntilReset = getMillisUntilMidnightCET()
    
    // Calculate current streak
    const streak = await calculateStreak(accountId)

    return NextResponse.json({
      canClaim,
      reward: DAILY_REWARD_COINS,
      claimedAt: claim?.claimed_at || null,
      msUntilReset,
      resetTime: '00:00 CET',
      streak
    })
  } catch (error) {
    console.error('Error in GET /api/daily-reward:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/daily-reward - Claim daily reward
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account_id } = body

    if (!account_id) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 })
    }

    const todayCET = getTodayCET()

    // Check if already claimed today
    const { data: existing } = await supabaseAdmin
      .from('daily_rewards')
      .select('id')
      .eq('account_id', account_id)
      .eq('claim_date', todayCET)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Daily reward already claimed today' },
        { status: 400 }
      )
    }

    // Record the claim
    const { error: insertError } = await supabaseAdmin
      .from('daily_rewards')
      .insert({
        account_id,
        claim_date: todayCET,
        coins_awarded: DAILY_REWARD_COINS,
        claimed_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error inserting daily reward:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Award coins
    const result = await addCoinsToAccount(account_id, DAILY_REWARD_COINS)

    if (!result.success) {
      // Rollback
      await supabaseAdmin
        .from('daily_rewards')
        .delete()
        .eq('account_id', account_id)
        .eq('claim_date', todayCET)

      return NextResponse.json(
        { error: result.error || 'Failed to award coins' },
        { status: 500 }
      )
    }

    // Calculate new streak after claim
    const streak = await calculateStreak(account_id)

    return NextResponse.json({
      success: true,
      message: `You earned ${DAILY_REWARD_COINS} coins!`,
      coins: DAILY_REWARD_COINS,
      streak
    })
  } catch (error) {
    console.error('Error in POST /api/daily-reward:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
