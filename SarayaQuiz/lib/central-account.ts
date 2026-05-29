/**
 * Central Account Management System Integration
 * 
 * This module handles all interactions with the centralized account system
 * that manages user accounts, coins, tokens, and XP across all platforms.
 * Uses direct Supabase connection via SSO (no platform API keys needed).
 */

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'https://accounts.saraya.solutions'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

export interface CentralAccount {
  id: string
  email: string
  name: string
  coin_wallets?: {
    coins_balance: number
    tokens_balance: number
  }
  xp_profiles?: {
    xp_total: number
    level: number
  }
}

export interface UserBalance {
  coins: number
  tokens: number
  xp: number
  level: number
}

/**
 * Check if an account exists in the central system
 */
export async function checkAccountExists(email: string): Promise<CentralAccount | null> {
  try {
    const response = await fetch(
      `${CENTRAL_API_URL}/api/accounts?search=${encodeURIComponent(email)}`,
      {
        headers: {
          'x-admin-email': ADMIN_EMAIL
        }
      }
    )

    if (!response.ok) {
      console.error('Failed to check account:', await response.text())
      return null
    }

    const result = await response.json()
    
    if (result.data && result.data.length > 0) {
      return result.data[0] as CentralAccount
    }
    
    return null
  } catch (error) {
    console.error('Error checking account:', error)
    return null
  }
}

/**
 * Create a new account in the central system
 */
export async function createCentralAccount(
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; account_id?: string; error?: string }> {
  try {
    // First check if account already exists
    const existing = await checkAccountExists(email)
    if (existing) {
      return { success: true, account_id: existing.id }
    }

    // Create new account
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': ADMIN_EMAIL
      },
      body: JSON.stringify({
        email,
        name,
        password,
        initialBalance: 0
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to create account:', errorText)
      return { success: false, error: 'Failed to create account in central system' }
    }

    const result = await response.json()
    return { success: true, account_id: result.data.id }
  } catch (error) {
    console.error('Error creating central account:', error)
    return { success: false, error: 'Network error while creating account' }
  }
}

/**
 * Record quiz completion and award rewards
 * Uses direct Supabase connection to central account system (no platform API keys needed)
 * @param attemptNumber - Which attempt this is (1 = first, 2 = second, etc.)
 * Rewards are granted for attempts 1 through max_reward_attempts (default 3)
 * First attempt gets first_time_multiplier, attempts 2-max get base rewards
 * After max_reward_attempts, no rewards are granted
 */
export async function recordQuizCompletion(
  account_id: string,
  quizId: string,
  score: number,
  max_score: number,
  quizConfig?: {
    reward_coins?: number
    reward_xp?: number
    reward_tokens?: number
    first_time_multiplier?: number
    full_marks_multiplier?: number
    max_reward_attempts?: number
  },
  attemptNumber: number = 1
): Promise<{ 
  success: boolean
  coinsGranted?: number
  xpGranted?: number
  tokensGranted?: number
  streakMultiplier?: number
  streakDays?: number
  error?: string 
}> {
  try {
    // Import the central account Supabase client
    const { createCentralAccountServiceClient } = await import('@/lib/supabase')
    const centralDb = createCentralAccountServiceClient()
    
    if (!centralDb) {
      console.error('Central account service client not available')
      return { success: false, error: 'Central account system not configured' }
    }
    
    // Fetch daily streak multiplier from RewardsCenter
    let streakMultiplier = 1.0
    let streakDays = 0
    try {
      const REWARDS_CENTER_URL = process.env.REWARDS_CENTER_URL || 'https://rewards.saraya.solutions'
      const streakResponse = await fetch(
        `${REWARDS_CENTER_URL}/api/daily-reward/streak?account_id=${encodeURIComponent(account_id)}`,
        { next: { revalidate: 60 } } // Cache for 1 minute
      )
      if (streakResponse.ok) {
        const streakData = await streakResponse.json()
        streakMultiplier = streakData.multiplier || 1.0
        streakDays = streakData.streak || 0
        console.log(`[recordQuizCompletion] Streak: ${streakDays} days, multiplier: ${streakMultiplier}x`)
      }
    } catch (streakError) {
      console.error('Failed to fetch streak multiplier:', streakError)
      // Continue without streak bonus
    }
    
    // Calculate rewards based on quiz configuration
    const percentage = max_score > 0 ? (score / max_score) * 100 : 0
    const isPerfect = percentage === 100
    
    // Base rewards from quiz settings (with defaults)
    const base_coins = quizConfig?.reward_coins ?? 10
    const base_xp = quizConfig?.reward_xp ?? 5
    const base_tokens = quizConfig?.reward_tokens ?? 0
    const first_time_multiplier = quizConfig?.first_time_multiplier ?? 5
    const full_marks_multiplier = quizConfig?.full_marks_multiplier ?? 2
    const max_reward_attempts = quizConfig?.max_reward_attempts ?? 3
    
    // Check if this attempt is eligible for rewards
    const isEligibleForRewards = attemptNumber <= max_reward_attempts
    const isFirstCompletion = attemptNumber === 1
    
    // Calculate actual rewards
    let coinsEarned = 0
    let xpEarned = 0
    let tokensEarned = 0
    
    if (isEligibleForRewards) {
      // Start with base rewards
      coinsEarned = base_coins
      xpEarned = base_xp
      tokensEarned = base_tokens
      
      // Apply first-time multiplier only for attempt #1
      if (isFirstCompletion) {
        coinsEarned = Math.round(base_coins * first_time_multiplier)
        xpEarned = Math.round(base_xp * first_time_multiplier)
      }
      
      // Apply full-marks multiplier for perfect scores
      if (isPerfect) {
        coinsEarned = Math.round(coinsEarned * full_marks_multiplier)
        xpEarned = Math.round(xpEarned * full_marks_multiplier)
      }
      
      // Apply daily streak multiplier (only if > 1.0)
      if (streakMultiplier > 1.0) {
        coinsEarned = Math.round(coinsEarned * streakMultiplier)
        xpEarned = Math.round(xpEarned * streakMultiplier)
      }
    }
    // If attemptNumber > max_reward_attempts, all rewards stay 0
    
    console.log(`[recordQuizCompletion] Account ${account_id}, attempt #${attemptNumber}, eligible: ${isEligibleForRewards}`)
    console.log(`[recordQuizCompletion] Rewards: ${coinsEarned} coins, ${xpEarned} XP, ${tokensEarned} tokens (streak: ${streakMultiplier}x)`)

    // Only update if there are rewards to grant
    if (coinsEarned > 0 || xpEarned > 0 || tokensEarned > 0) {
      // Update coin wallet
      if (coinsEarned > 0 || tokensEarned > 0) {
        const { data: wallet } = await centralDb
          .from('coin_wallets')
          .select('coins_balance, tokens_balance')
          .eq('account_id', account_id)
          .single()
        
        if (wallet) {
          const { error: walletError } = await centralDb
            .from('coin_wallets')
            .update({
              coins_balance: wallet.coins_balance + coinsEarned,
              tokens_balance: wallet.tokens_balance + tokensEarned,
            })
            .eq('account_id', account_id)
          
          if (walletError) {
            console.error('Failed to update wallet:', walletError)
          } else {
            console.log(`[recordQuizCompletion] Updated wallet: +${coinsEarned} coins, +${tokensEarned} tokens`)
          }
        }
      }
      
      // Update XP profile
      if (xpEarned > 0) {
        const { data: xpProfile } = await centralDb
          .from('xp_profiles')
          .select('xp_total, xp_current_level, xp_next_level, level')
          .eq('account_id', account_id)
          .single()
        
        if (xpProfile) {
          const newXpTotal = xpProfile.xp_total + xpEarned
          let newXpCurrentLevel = xpProfile.xp_current_level + xpEarned
          let newLevel = xpProfile.level
          let newXpNextLevel = xpProfile.xp_next_level
          
          // Check for level up (every level * 1000 XP)
          while (newXpCurrentLevel >= newXpNextLevel) {
            newXpCurrentLevel -= newXpNextLevel
            newLevel += 1
            newXpNextLevel = newLevel * 1000
          }
          
          const { error: xpError } = await centralDb
            .from('xp_profiles')
            .update({
              xp_total: newXpTotal,
              xp_current_level: newXpCurrentLevel,
              xp_next_level: newXpNextLevel,
              level: newLevel,
              ...(newLevel > xpProfile.level ? { last_level_up_at: new Date().toISOString() } : {})
            })
            .eq('account_id', account_id)
          
          if (xpError) {
            console.error('Failed to update XP:', xpError)
          } else {
            console.log(`[recordQuizCompletion] Updated XP: +${xpEarned} (total: ${newXpTotal}, level: ${newLevel})`)
          }
        }
      }
      
      // Create activity event for history
      // Get or create QUIZ platform ID
      const { data: quizPlatform } = await centralDb
        .from('platforms')
        .select('id')
        .eq('code', 'QUIZ')
        .maybeSingle()
      
      let platformId = quizPlatform?.id
      if (!platformId) {
        // Create QUIZ platform if it doesn't exist
        const { data: newPlatform } = await centralDb
          .from('platforms')
          .insert({
            id: crypto.randomUUID(),
            code: 'QUIZ',
            name: 'Saraya Quiz',
            type: 'WEB_APP',
          })
          .select('id')
          .single()
        platformId = newPlatform?.id
      }
      
      if (platformId) {
        await centralDb.from('activity_events').insert({
          account_id: account_id,
          platform_id: platformId,
          event_type: isPerfect ? 'PERFECT_SCORE' : 'QUIZ_COMPLETED',
          coins_delta: coinsEarned,
          tokens_delta: tokensEarned,
          xp_delta: xpEarned,
          metadata: {
            quizId,
            score,
            max_score,
            percentage: percentage.toFixed(1),
            isPerfect,
            attemptNumber,
            max_reward_attempts,
            isFirstCompletion,
            streakMultiplier,
            streakDays,
          },
        })
      }
    }

    return { 
      success: true,
      coinsGranted: coinsEarned,
      xpGranted: xpEarned,
      tokensGranted: tokensEarned,
      streakMultiplier: streakMultiplier > 1.0 ? streakMultiplier : undefined,
      streakDays: streakDays > 0 ? streakDays : undefined
    }
  } catch (error) {
    console.error('Error recording quiz completion:', error)
    return { success: false, error: 'Failed to record quiz completion' }
  }
}

/**
 * Get user balance (coins, tokens, XP, level)
 */
export async function getUserBalance(email: string): Promise<UserBalance | null> {
  try {
    const account = await checkAccountExists(email)
    
    if (!account) {
      return null
    }
    
    return {
      coins: account.coin_wallets?.coins_balance || 0,
      tokens: account.coin_wallets?.tokens_balance || 0,
      xp: account.xp_profiles?.xp_total || 0,
      level: account.xp_profiles?.level || 1
    }
  } catch (error) {
    console.error('Error getting user balance:', error)
    return null
  }
}

/**
 * Get user balance by account_id
 */
export async function getUserBalanceById(account_id: string): Promise<UserBalance | null> {
  try {
    const response = await fetch(
      `${CENTRAL_API_URL}/api/accounts?search=${account_id}`,
      {
        headers: {
          'x-admin-email': ADMIN_EMAIL
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    
    if (result.data && result.data.length > 0) {
      const account = result.data[0] as CentralAccount
      return {
        coins: account.coin_wallets?.coins_balance || 0,
        tokens: account.coin_wallets?.tokens_balance || 0,
        xp: account.xp_profiles?.xp_total || 0,
        level: account.xp_profiles?.level || 1
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting user balance by ID:', error)
    return null
  }
}
