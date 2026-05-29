import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const REWARDS_URL = process.env.NEXT_PUBLIC_REWARDS_URL || 'https://rewards.saraya.solutions'

// Reward configuration
const DAILY_LOGIN_REWARD = 500

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

// Grant coins to user's central account
async function grantCoins(accounts: any, accountId: string, amount: number, reason: string): Promise<boolean> {
  try {
    // Get current wallet
    const { data: wallet, error: walletError } = await accounts
      .from('accounts_coin_wallets')
      .select('coins_balance')
      .eq('account_id', accountId)
      .single()

    if (walletError || !wallet) {
      console.error('Wallet not found:', walletError)
      return false
    }

    // Update balance
    const { error: updateError } = await accounts
      .from('accounts_coin_wallets')
      .update({ coins_balance: wallet.coins_balance + amount })
      .eq('account_id', accountId)

    if (updateError) {
      console.error('Failed to update wallet:', updateError)
      return false
    }

    // Log activity event
    const { data: platform } = await accounts
      .from('accounts_platforms')
      .select('id')
      .eq('code', 'PAMETNO')
      .maybeSingle()

    let platformId = platform?.id
    if (!platformId) {
      const { data: newPlatform } = await accounts
        .from('accounts_platforms')
        .insert({
          id: crypto.randomUUID(),
          code: 'PAMETNO',
          name: 'Pametno Saraya',
          type: 'WEB_APP',
        })
        .select('id')
        .single()
      platformId = newPlatform?.id
    }

    if (platformId) {
      await accounts.from('accounts_activity_events').insert({
        account_id: accountId,
        platform_id: platformId,
        event_type: 'DAILY_LOGIN',
        coins_delta: amount,
        metadata: { reason },
      })
    }
    
    console.log(`[grantCoins] Granted ${amount} coins to ${accountId}: ${reason}`)
    return true
  } catch (error) {
    console.error('Error granting coins:', error)
    return false
  }
}

/**
 * POST /api/rewards/daily-login - Claim daily login reward (500 coins)
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

    // Get account ID
    const { data: account, error: accountError } = await accounts
      .from('accounts_accounts')
      .select('id')
      .eq('email', user.email)
      .single()

    if (accountError || !account) {
      console.error('Account not found:', accountError)
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const today = getTodayCET()

    // Get or create today's record
    let { data: record, error: recordError } = await sc
      .from('pametno_daily_rewards')
      .select('*')
      .eq('account_id', account.id)
      .eq('reward_date', today)
      .single()

    if (recordError && recordError.code !== 'PGRST116') {
      console.error('Error fetching record:', recordError)
    }

    if (!record) {
      // Create new record
      const { data: newRecord, error: createError } = await sc
        .from('pametno_daily_rewards')
        .insert({
          account_id: account.id,
          reward_date: today,
          daily_login_claimed: false,
          articles_read: 0,
          articles_coins_earned: 0,
          article_slugs: [],
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
    const { streak, multiplier } = await getStreakMultiplier(account.id)
    const finalReward = Math.round(DAILY_LOGIN_REWARD * multiplier)
    
    // Grant coins
    const granted = await grantCoins(
      accounts,
      account.id,
      finalReward,
      `Daily login reward (${multiplier}x streak bonus)`
    )

    if (!granted) {
      return NextResponse.json({ error: 'Failed to grant coins' }, { status: 500 })
    }

    // Update record
    const { error: updateError } = await sc
      .from('pametno_daily_rewards')
      .update({
        daily_login_claimed: true,
        daily_login_coins: finalReward,
      })
      .eq('account_id', account.id)
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
