import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { grantExploreCoins, resolveAccountId } from '@/lib/rewards-account'

const REWARDS_URL = process.env.NEXT_PUBLIC_REWARDS_URL || 'https://rewards.saraya.solutions'

// Reward configuration
const DAILY_LOGIN_REWARD = 300

// Get current date in CET (Central European Time) as YYYY-MM-DD
function getTodayCET(): string {
  const now = new Date()
  const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  const year = cetDate.getFullYear()
  const month = String(cetDate.getMonth() + 1).padStart(2, '0')
  const day = String(cetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Create Supabase service client for central account system
function createCentralSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Get streak multiplier from RewardsCenter
async function getStreakMultiplier(accountId: string): Promise<{ streak: number; multiplier: number }> {
  try {
    const response = await fetch(
      `${REWARDS_URL}/api/daily-reward/streak?account_id=${encodeURIComponent(accountId)}`,
      { cache: 'no-store' }
    )
    if (response.ok) {
      const data = await response.json()
      return { streak: data.streak || 0, multiplier: data.multiplier || 1.0 }
    }
  } catch (error) {
    console.error('Failed to fetch streak multiplier:', error)
  }
  return { streak: 0, multiplier: 1.0 }
}

/**
 * POST /api/rewards/daily-login - Claim daily login reward (300 coins)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const supabase = createCentralSupabaseClient()
    const sc = supabase.schema('sarayaconnect')
    const accounts = supabase.schema('accountsystem')
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const accountId = await resolveAccountId(accounts, user.email!)
    if (!accountId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const today = getTodayCET()

    // Get or create today's record
    let { data: record, error: recordError } = await sc
      .from('es_daily_rewards')
      .select('*')
      .eq('account_id', accountId)
      .eq('reward_date', today)
      .single()

    if (recordError && recordError.code !== 'PGRST116') {
      console.error('Error fetching record:', recordError)
    }

    if (!record) {
      // Create new record
      const { data: newRecord, error: createError } = await sc
        .from('es_daily_rewards')
        .insert({
          account_id: accountId,
          reward_date: today,
          daily_login_claimed: false,
          items_read: 0,
          items_coins_earned: 0,
          item_slugs: [],
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Failed to create record:', createError)
        return NextResponse.json({ error: 'Database error', details: createError.message }, { status: 500 })
      }
      record = newRecord
    }
    
    // Check if already claimed
    if (record.daily_login_claimed) {
      return NextResponse.json({
        success: false,
        error: 'Daily login already claimed',
        alreadyClaimed: true,
      })
    }
    
    // Get streak multiplier
    const { streak, multiplier } = await getStreakMultiplier(accountId)
    const finalReward = Math.round(DAILY_LOGIN_REWARD * multiplier)
    
    const granted = await grantExploreCoins(
      accounts,
      accountId,
      finalReward,
      `Daily login reward (${multiplier}x streak bonus)`,
      { event_type: 'DAILY_LOGIN' }
    )

    if (!granted) {
      return NextResponse.json({ error: 'Failed to grant coins' }, { status: 500 })
    }

    // Update record
    const { error: updateError } = await sc
      .from('es_daily_rewards')
      .update({
        daily_login_claimed: true,
        daily_login_coins: finalReward,
      })
      .eq('account_id', accountId)
      .eq('reward_date', today)
    
    if (updateError) {
      console.error('Failed to update record:', updateError)
    }
    
    return NextResponse.json({
      success: true,
      coinsEarned: finalReward,
      baseReward: DAILY_LOGIN_REWARD,
      streak,
      multiplier,
    })
  } catch (error) {
    console.error('Error in POST /api/rewards/daily-login:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
