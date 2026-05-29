import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

const REFERRAL_REWARD_COINS = 3000 // Coins earned per successful referral
const MAX_REFERRAL_REWARDS_PER_MONTH = 10 // Max rewards per month

// Generate a unique referral code for a user
function generateReferralCode(accountId: string, name: string): string {
  // Create a code from first part of name + last 4 chars of ID
  const namePart = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'USER'
  const idPart = accountId.slice(-4).toUpperCase()
  return `${namePart}${idPart}`
}

// Get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
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
 * GET /api/referrals - Get referral info for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 })
    }

    // Get user info for generating referral code
    let userName = 'USER'
    try {
      const userResponse = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
        headers: { 'x-admin-email': ADMIN_EMAIL }
      })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        userName = userData.name || 'USER'
      }
    } catch (e) {
      console.log('Could not fetch user name, using default')
    }

    // Check if user already has a referral code stored
    const { data: existingReferral } = await supabaseAdmin
      .from('user_referrals')
      .select('referral_code, referred_by, referred_at')
      .eq('account_id', accountId)
      .single()

    let referralCode = existingReferral?.referral_code

    // If no referral code exists, generate one and store it
    if (!referralCode) {
      referralCode = generateReferralCode(accountId, userName)
      
      // Store the referral code
      await supabaseAdmin
        .from('user_referrals')
        .upsert({
          account_id: accountId,
          referral_code: referralCode,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'account_id'
        })
    }

    // Get stats: how many people this user has referred
    const { data: referrals, error: referralsError } = await supabaseAdmin
      .from('user_referrals')
      .select('account_id, referred_at')
      .eq('referred_by', accountId)

    const totalReferred = referrals?.length || 0
    const successfulReferrals = referrals?.filter(r => r.referred_at)?.length || 0

    // Get how many rewards claimed this month
    const currentMonth = getCurrentMonth()
    const { data: monthlyRewards } = await supabaseAdmin
      .from('referral_rewards')
      .select('id')
      .eq('referrer_id', accountId)
      .gte('created_at', `${currentMonth}-01T00:00:00Z`)

    const rewardsClaimedThisMonth = monthlyRewards?.length || 0

    // Calculate total earned from referrals
    const { data: allRewards } = await supabaseAdmin
      .from('referral_rewards')
      .select('coins_awarded')
      .eq('referrer_id', accountId)

    const totalEarned = allRewards?.reduce((sum, r) => sum + (r.coins_awarded || 0), 0) || 0

    // Check if user has used a referral code
    const hasUsedReferral = !!existingReferral?.referred_by

    return NextResponse.json({
      referralCode,
      totalReferred,
      successfulReferrals,
      totalEarned,
      rewardsClaimedThisMonth,
      maxRewardsPerMonth: MAX_REFERRAL_REWARDS_PER_MONTH,
      rewardAmount: REFERRAL_REWARD_COINS,
      hasUsedReferral,
      referredBy: existingReferral?.referred_by || null,
      referredAt: existingReferral?.referred_at || null
    })

  } catch (error) {
    console.error('Error in GET /api/referrals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/referrals - Enter a referral code (can only be done once per account)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account_id, referral_code } = body

    if (!account_id) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 })
    }

    if (!referral_code) {
      return NextResponse.json({ error: 'referral_code is required' }, { status: 400 })
    }

    const normalizedCode = referral_code.toUpperCase().trim()

    // Check if user has already used a referral code
    const { data: existingReferral } = await supabaseAdmin
      .from('user_referrals')
      .select('referred_by, referred_at')
      .eq('account_id', account_id)
      .single()

    if (existingReferral?.referred_by) {
      return NextResponse.json(
        { error: 'You have already used a referral code' },
        { status: 400 }
      )
    }

    // Find who owns this referral code
    const { data: referrer, error: referrerError } = await supabaseAdmin
      .from('user_referrals')
      .select('account_id, referral_code')
      .eq('referral_code', normalizedCode)
      .single()

    if (referrerError || !referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      )
    }

    // Can't refer yourself
    if (referrer.account_id === account_id) {
      return NextResponse.json(
        { error: 'You cannot use your own referral code' },
        { status: 400 }
      )
    }

    // Check if referrer has hit monthly limit
    const currentMonth = getCurrentMonth()
    const { data: referrerMonthlyRewards } = await supabaseAdmin
      .from('referral_rewards')
      .select('id')
      .eq('referrer_id', referrer.account_id)
      .gte('created_at', `${currentMonth}-01T00:00:00Z`)

    const referrerRewardsThisMonth = referrerMonthlyRewards?.length || 0

    // Update or create the user's referral record
    let updateError;
    if (existingReferral) {
      // User already has a record, just update referred_by and referred_at
      const { error } = await supabaseAdmin
        .from('user_referrals')
        .update({
          referred_by: referrer.account_id,
          referred_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('account_id', account_id)
      updateError = error
    } else {
      // New user, create full record with generated referral code
      // Get user name for code generation
      let userName = 'USER'
      try {
        const userResponse = await fetch(`${CENTRAL_API_URL}/api/accounts/${account_id}`, {
          headers: { 'x-admin-email': ADMIN_EMAIL }
        })
        if (userResponse.ok) {
          const userData = await userResponse.json()
          userName = userData.name || 'USER'
        }
      } catch (e) {
        console.log('Could not fetch user name, using default')
      }
      
      const { error } = await supabaseAdmin
        .from('user_referrals')
        .insert({
          account_id: account_id,
          referral_code: generateReferralCode(account_id, userName),
          referred_by: referrer.account_id,
          referred_at: new Date().toISOString()
        })
      updateError = error
    }

    if (updateError) {
      console.error('Error updating referral:', updateError)
      return NextResponse.json({ error: 'Failed to apply referral code' }, { status: 500 })
    }

    // Award coins to referrer (if they haven't hit monthly limit)
    let referrerRewarded = false
    if (referrerRewardsThisMonth < MAX_REFERRAL_REWARDS_PER_MONTH) {
      // Record the reward
      await supabaseAdmin
        .from('referral_rewards')
        .insert({
          referrer_id: referrer.account_id,
          referred_id: account_id,
          coins_awarded: REFERRAL_REWARD_COINS,
          created_at: new Date().toISOString()
        })

      // Add coins to referrer
      const result = await addCoinsToAccount(referrer.account_id, REFERRAL_REWARD_COINS)
      referrerRewarded = result.success
    }

    // Award coins to the new user who entered the code
    await supabaseAdmin
      .from('referral_rewards')
      .insert({
        referrer_id: account_id, // Self-reward for using a code
        referred_id: referrer.account_id,
        coins_awarded: REFERRAL_REWARD_COINS,
        created_at: new Date().toISOString(),
        is_welcome_bonus: true
      })

    const selfRewardResult = await addCoinsToAccount(account_id, REFERRAL_REWARD_COINS)

    return NextResponse.json({
      success: true,
      message: `Referral code applied! You earned ${REFERRAL_REWARD_COINS} coins!`,
      coinsEarned: selfRewardResult.success ? REFERRAL_REWARD_COINS : 0,
      referrerRewarded
    })

  } catch (error) {
    console.error('Error in POST /api/referrals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
