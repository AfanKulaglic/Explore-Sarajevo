import { createSupabaseServiceClient } from '@/lib/supabase'
import crypto from 'crypto'

const DEVICE_ID_PEPPER = process.env.DEVICE_ID_PEPPER || 'saraya-quiz-device-pepper-2024'

export interface QuizRewardConfig {
  reward_coins: number
  reward_xp: number
  reward_tokens: number
  first_time_multiplier: number
  full_marks_multiplier: number
  allow_anonymous: boolean
  requires_account: boolean
  max_attempts_per_device: number | null
  cooldown_minutes: number | null
}

export interface CompletionCheckResult {
  is_first_for_device: boolean
  is_first_for_account: boolean
  deviceAttemptCount: number
  accountAttemptCount: number
  canAttempt: boolean
  cooldownRemaining: number | null // minutes
}

export interface RewardCalculation {
  base_coins: number
  base_xp: number
  base_tokens: number
  multiplier: number
  total_coins: number
  total_xp: number
  total_tokens: number
  isFirstCompletion: boolean
  is_full_marks: boolean
  bonusReason: string | null
  multiplierBreakdown: {
    firstTime: number
    fullMarks: number
    combined: number
  }
}

/**
 * Hash a device ID for privacy
 */
export function hashDeviceId(rawDeviceId: string): string {
  return crypto
    .createHash('sha256')
    .update(rawDeviceId + DEVICE_ID_PEPPER)
    .digest('hex')
}

/**
 * Get quiz reward configuration from database
 * Falls back to defaults if reward columns don't exist yet
 */
export async function getQuizRewardConfig(quizId: string): Promise<QuizRewardConfig | null> {
  const supabase = createSupabaseServiceClient()
  
  try {
    const { data: quiz, error } = await supabase
      .from('posts')
      .select('id, reward_coins, reward_xp, reward_tokens, first_time_multiplier, full_marks_multiplier, allow_anonymous, requires_account, max_attempts_per_device, cooldown_minutes')
      .eq('id', quizId)
      .single()

    if (error) {
      // If columns don't exist, fall back to just checking if quiz exists
      const { data: quizExists } = await supabase
        .from('posts')
        .select('id')
        .eq('id', quizId)
        .single()
      
      if (!quizExists) return null
      
      // Return defaults
      return {
        reward_coins: 10,
        reward_xp: 5,
        reward_tokens: 0,
        first_time_multiplier: 5.0,
        full_marks_multiplier: 2.0,
        allow_anonymous: true,
        requires_account: false,
        max_attempts_per_device: null,
        cooldown_minutes: null,
      }
    }

    return {
      reward_coins: quiz.reward_coins ?? 10,
      reward_xp: quiz.reward_xp ?? 5,
      reward_tokens: quiz.reward_tokens ?? 0,
      first_time_multiplier: Number(quiz.first_time_multiplier ?? 5.0),
      full_marks_multiplier: Number(quiz.full_marks_multiplier ?? 2.0),
      allow_anonymous: quiz.allow_anonymous ?? true,
      requires_account: quiz.requires_account ?? false,
      max_attempts_per_device: quiz.max_attempts_per_device ?? null,
      cooldown_minutes: quiz.cooldown_minutes ?? null,
    }
  } catch (error) {
    console.error('Error fetching quiz reward config:', error)
    return {
      reward_coins: 10,
      reward_xp: 5,
      reward_tokens: 0,
      first_time_multiplier: 5.0,
      full_marks_multiplier: 2.0,
      allow_anonymous: true,
      requires_account: false,
      max_attempts_per_device: null,
      cooldown_minutes: null,
    }
  }
}

/**
 * Check if this is a first-time completion and if the user can attempt
 */
export async function checkCompletion(
  quizId: string,
  device_hash: string,
  account_id?: string | null
): Promise<CompletionCheckResult> {
  const supabase = createSupabaseServiceClient()
  const config = await getQuizRewardConfig(quizId)

  if (!config) {
    return {
      is_first_for_device: false,
      is_first_for_account: false,
      deviceAttemptCount: 0,
      accountAttemptCount: 0,
      canAttempt: false,
      cooldownRemaining: null,
    }
  }

  // Check for existing completion record (if table exists)
  let existingCompletion = null
  try {
    const { data } = await supabase
      .from('completions')
      .select('id')
      .eq('quiz_post_id', quizId)
      .eq('device_hash', device_hash)
      .single()
    existingCompletion = data
  } catch {
    // Table might not exist yet
  }

  // Check existing completed attempts for this device
  const { data: deviceAttempts } = await supabase
    .from('attempts')
    .select('id, finished_at, created_at')
    .eq('quiz_post_id', quizId)
    .eq('device_hash', device_hash)
    .not('finished_at', 'is', null)
    .order('created_at', { ascending: false })

  const deviceAttemptCount = deviceAttempts?.length || 0
  const is_first_for_device = !existingCompletion && deviceAttemptCount === 0

  // Check existing completed attempts for this account
  let accountAttemptCount = 0
  let is_first_for_account = false

  if (account_id) {
    const { data: accountAttempts } = await supabase
      .from('attempts')
      .select('id, finished_at')
      .eq('quiz_post_id', quizId)
      .eq('account_id', account_id)
      .not('finished_at', 'is', null)

    accountAttemptCount = accountAttempts?.length || 0
    is_first_for_account = accountAttemptCount === 0
  }

  // Check cooldown
  let cooldownRemaining: number | null = null
  if (config.cooldown_minutes && deviceAttempts && deviceAttempts.length > 0) {
    const lastAttempt = deviceAttempts[0]
    const elapsed = (Date.now() - new Date(lastAttempt.created_at).getTime()) / 60000
    if (elapsed < config.cooldown_minutes) {
      cooldownRemaining = Math.ceil(config.cooldown_minutes - elapsed)
    }
  }

  // Determine if can attempt
  let canAttempt = true
  if (config.max_attempts_per_device && deviceAttemptCount >= config.max_attempts_per_device) {
    canAttempt = false
  }
  if (cooldownRemaining !== null && cooldownRemaining > 0) {
    canAttempt = false
  }

  return {
    is_first_for_device,
    is_first_for_account,
    deviceAttemptCount,
    accountAttemptCount,
    canAttempt,
    cooldownRemaining,
  }
}

/**
 * Calculate rewards for a quiz completion with detailed multiplier system:
 * 
 * Scenarios:
 * 1. First time + Full marks = first_time_multiplier × full_marks_multiplier (e.g., 5x × 2x = 10x)
 * 2. First time + Partial score = first_time_multiplier only (e.g., 5x)
 * 3. Repeat + Full marks = full_marks_multiplier only (e.g., 2x)
 * 4. Repeat + Partial = Base rewards (1x)
 */
export function calculateRewards(
  config: QuizRewardConfig,
  is_first_for_device: boolean,
  is_first_for_account: boolean,
  score: number,
  max_score: number
): RewardCalculation {
  const scorePercent = max_score > 0 ? score / max_score : 0
  const is_full_marks = scorePercent >= 1.0 // 100% correct

  // Base rewards (not scaled by score, you get full base if you complete)
  const base_coins = config.reward_coins
  const base_xp = config.reward_xp
  const base_tokens = config.reward_tokens

  // Determine first-time status
  const isFirstCompletion = is_first_for_device || is_first_for_account

  // Calculate individual multipliers
  const first_time_multiplier = isFirstCompletion ? config.first_time_multiplier : 1.0
  const full_marks_multiplier = is_full_marks ? config.full_marks_multiplier : 1.0

  // Combined multiplier (multiplicative stacking)
  const combinedMultiplier = first_time_multiplier * full_marks_multiplier

  // Build bonus reason string
  let bonusReason: string | null = null
  const bonusParts: string[] = []

  if (isFirstCompletion && is_full_marks) {
    bonusParts.push(`🎯 Perfect Score! First time with 100% correct (${combinedMultiplier}x)`)
  } else if (isFirstCompletion) {
    if (is_first_for_account) {
      bonusParts.push(`✨ First time completion bonus! (${first_time_multiplier}x)`)
    } else {
      bonusParts.push(`✨ First time on this device! (${first_time_multiplier}x)`)
    }
  } else if (is_full_marks) {
    bonusParts.push(`🌟 Perfect Score bonus! (${full_marks_multiplier}x)`)
  }

  if (bonusParts.length > 0) {
    bonusReason = bonusParts.join(' + ')
  }

  // Calculate final rewards
  // For non-perfect scores, scale by percentage on repeat attempts only
  const scoreScale = isFirstCompletion ? 1.0 : scorePercent
  const finalMultiplier = combinedMultiplier * scoreScale

  return {
    base_coins,
    base_xp,
    base_tokens,
    multiplier: finalMultiplier,
    total_coins: Math.round(base_coins * finalMultiplier),
    total_xp: Math.round(base_xp * finalMultiplier),
    total_tokens: Math.round(base_tokens * finalMultiplier),
    isFirstCompletion,
    is_full_marks,
    bonusReason,
    multiplierBreakdown: {
      firstTime: first_time_multiplier,
      fullMarks: full_marks_multiplier,
      combined: combinedMultiplier,
    },
  }
}

/**
 * Record a quiz completion and grant rewards
 */
export async function recordCompletion(params: {
  quizId: string
  attempt_id: string
  device_hash: string
  account_id?: string | null
  score: number
  max_score: number
  time_spent_seconds?: number
}): Promise<{
  completion: any
  rewards: RewardCalculation
  rewards_granted: boolean
}> {
  const { quizId, attempt_id, device_hash, account_id, score, max_score, time_spent_seconds } = params
  const supabase = createSupabaseServiceClient()

  const config = await getQuizRewardConfig(quizId)
  if (!config) {
    throw new Error('Quiz not found')
  }

  const check = await checkCompletion(quizId, device_hash, account_id)
  const rewards = calculateRewards(
    config,
    check.is_first_for_device,
    check.is_first_for_account,
    score,
    max_score
  )

  const percentage = max_score > 0 ? (score / max_score) * 100 : 0

  // Update attempt with completion info
  await supabase
    .from('attempts')
    .update({
      score,
      max_score,
      finished_at: new Date().toISOString(),
      // These columns may not exist yet
      ...(time_spent_seconds !== undefined && { time_spent_seconds }),
      completion_percentage: percentage,
      questions_answered: max_score,
      correct_answers: score,
      rewards_granted: false,
    })
    .eq('id', attempt_id)

  // Create or update completion record (if table exists)
  let completion: any = {
    id: attempt_id,
    quiz_post_id: quizId,
    device_hash,
    account_id,
    is_first_for_device: check.is_first_for_device,
    is_first_for_account: check.is_first_for_account,
    is_full_marks: rewards.is_full_marks,
    score,
    max_score,
    percentage,
    time_spent_seconds,
    rewards_claimed: false,
  }

  try {
    // Try to upsert into QuizCompletion table
    const { data, error } = await supabase
      .from('completions')
      .upsert({
        quiz_post_id: quizId,
        device_hash,
        account_id,
        attempt_id,
        is_first_for_device: check.is_first_for_device,
        is_first_for_account: check.is_first_for_account,
        is_full_marks: rewards.is_full_marks,
        base_coins: rewards.base_coins,
        base_xp: rewards.base_xp,
        base_tokens: rewards.base_tokens,
        multiplier_applied: rewards.multiplier,
        total_coins: rewards.total_coins,
        total_xp: rewards.total_xp,
        total_tokens: rewards.total_tokens,
        score,
        max_score,
        percentage,
        time_spent_seconds,
        rewards_claimed: false,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'quiz_post_id,device_hash',
      })
      .select()
      .single()

    if (data) {
      completion = data
    }
  } catch (error) {
    console.log('[QuizCompletion] Table not ready yet, using fallback')
  }

  // Grant rewards if user is logged in
  let rewards_granted = false
  if (account_id && rewards.total_coins > 0) {
    try {
      rewards_granted = await grantRewardsToAccount(account_id, {
        coins: rewards.total_coins,
        xp: rewards.total_xp,
        tokens: rewards.total_tokens,
        reason: `Quiz completion: ${quizId}`,
        isFirstTime: rewards.isFirstCompletion,
        is_full_marks: rewards.is_full_marks,
      })

      if (rewards_granted) {
        // Update attempt as rewarded
        await supabase
          .from('attempts')
          .update({ rewards_granted: true })
          .eq('id', attempt_id)

        // Update completion as rewarded
        try {
          await supabase
            .from('completions')
            .update({ rewards_claimed: true })
            .eq('id', completion.id)
        } catch {
          // Table might not exist
        }
      }
    } catch (error) {
      console.error('Failed to grant rewards:', error)
    }
  }

  // Update device stats
  await updateDeviceRecord(device_hash, account_id)

  // Track completion event
  await trackEvent({
    event_type: 'quiz_complete',
    event_data: {
      score,
      max_score,
      percentage,
      isFirstTime: rewards.isFirstCompletion,
      is_full_marks: rewards.is_full_marks,
      rewards_granted,
      multiplier: rewards.multiplier,
      total_coins: rewards.total_coins,
      total_xp: rewards.total_xp,
    },
    quiz_post_id: quizId,
    attempt_id,
    device_hash,
    account_id,
  })

  return { completion, rewards, rewards_granted }
}

/**
 * Grant rewards to a user's central account
 * Uses direct Supabase connection (SSO approach, no platform API keys needed)
 */
async function grantRewardsToAccount(
  account_id: string,
  rewards: {
    coins: number
    xp: number
    tokens: number
    reason: string
    isFirstTime?: boolean
    is_full_marks?: boolean
  }
): Promise<boolean> {
  try {
    const { createCentralAccountServiceClient } = await import('@/lib/supabase')
    const centralDb = createCentralAccountServiceClient()
    
    if (!centralDb) {
      console.error('[grantRewardsToAccount] Central account service client not available')
      return false
    }
    
    // Update coin wallet
    if (rewards.coins > 0 || rewards.tokens > 0) {
      const { data: wallet } = await centralDb
        .from('coin_wallets')
        .select('coins_balance, tokens_balance')
        .eq('account_id', account_id)
        .single()
      
      if (wallet) {
        await centralDb
          .from('coin_wallets')
          .update({
            coins_balance: wallet.coins_balance + rewards.coins,
            tokens_balance: wallet.tokens_balance + rewards.tokens,
          })
          .eq('account_id', account_id)
      }
    }
    
    // Update XP
    if (rewards.xp > 0) {
      const { data: xpProfile } = await centralDb
        .from('xp_profiles')
        .select('xp_total, xp_current_level, xp_next_level, level')
        .eq('account_id', account_id)
        .single()
      
      if (xpProfile) {
        const newXpTotal = xpProfile.xp_total + rewards.xp
        let newXpCurrentLevel = xpProfile.xp_current_level + rewards.xp
        let newLevel = xpProfile.level
        let newXpNextLevel = xpProfile.xp_next_level
        
        while (newXpCurrentLevel >= newXpNextLevel) {
          newXpCurrentLevel -= newXpNextLevel
          newLevel += 1
          newXpNextLevel = newLevel * 1000
        }
        
        await centralDb
          .from('xp_profiles')
          .update({
            xp_total: newXpTotal,
            xp_current_level: newXpCurrentLevel,
            xp_next_level: newXpNextLevel,
            level: newLevel,
            ...(newLevel > xpProfile.level ? { last_level_up_at: new Date().toISOString() } : {})
          })
          .eq('account_id', account_id)
      }
    }

    console.log(`[grantRewardsToAccount] Granted ${rewards.coins} coins, ${rewards.xp} XP, ${rewards.tokens} tokens to ${account_id}`)
    return true
  } catch (error) {
    console.error('Error granting rewards:', error)
    return false
  }
}

/**
 * Track analytics event
 */
export async function trackEvent(params: {
  event_type: string
  event_data?: Record<string, any>
  quiz_post_id?: string
  attempt_id?: string
  question_id?: string
  device_hash: string
  account_id?: string | null
  session_id?: string
  platform?: string
  referrer?: string
  user_agent?: string
}): Promise<void> {
  const supabase = createSupabaseServiceClient()
  
  try {
    await supabase.from('analytics_events').insert({
      event_type: params.event_type,
      event_data: params.event_data || {},
      quiz_post_id: params.quiz_post_id,
      attempt_id: params.attempt_id,
      question_id: params.question_id,
      device_hash: params.device_hash,
      account_id: params.account_id,
      session_id: params.session_id,
      platform: params.platform,
      referrer: params.referrer,
      user_agent: params.user_agent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    // Table might not exist yet, log to console
    console.log('[Analytics]', params.event_type, {
      quizId: params.quiz_post_id,
      device_hash: params.device_hash?.substring(0, 8) + '...',
      account_id: params.account_id,
      ...params.event_data,
    })
  }
}

/**
 * Update or create device record
 */
export async function updateDeviceRecord(
  device_hash: string,
  account_id?: string | null,
  metadata?: {
    user_agent?: string
    platform?: string
    browser?: string
    os?: string
  }
): Promise<void> {
  const supabase = createSupabaseServiceClient()
  
  try {
    // Check if device exists
    const { data: existing } = await supabase
      .from('devices')
      .select('id, account_ids, linked_accounts_count')
      .eq('device_hash', device_hash)
      .single()

    if (existing) {
      // Update existing device
      const account_ids: string[] = existing.account_ids || []
      const newAccountIds = account_id && !account_ids.includes(account_id)
        ? [...account_ids, account_id]
        : account_ids

      // Get current total_plays for incrementing
      const { data: currentDevice } = await supabase
        .from('devices')
        .select('total_plays')
        .eq('device_hash', device_hash)
        .single()
      
      const currentPlays = currentDevice?.total_plays || 0

      await supabase
        .from('devices')
        .update({
          total_plays: currentPlays + 1,
          last_seen_at: new Date().toISOString(),
          account_ids: newAccountIds,
          linked_accounts_count: newAccountIds.length,
          ...(metadata?.user_agent && { user_agent: metadata.user_agent }),
          ...(metadata?.platform && { platform: metadata.platform }),
          ...(metadata?.browser && { browser: metadata.browser }),
          ...(metadata?.os && { os: metadata.os }),
        })
        .eq('device_hash', device_hash)

      // Check for suspicious activity (multiple accounts from same device)
      if (newAccountIds.length > 2) {
        await supabase.from('suspicious_activity').insert({
          activity_type: 'multi_account',
          severity: newAccountIds.length > 5 ? 'high' : newAccountIds.length > 3 ? 'medium' : 'low',
          device_hash,
          account_ids: newAccountIds,
          details: {
            linked_accounts_count: newAccountIds.length,
            triggeredBy: account_id,
          },
        })
      }
    } else {
      // Create new device record
      await supabase.from('devices').insert({
        device_hash,
        total_plays: 1,
        account_ids: account_id ? [account_id] : [],
        linked_accounts_count: account_id ? 1 : 0,
        ...metadata,
      })
    }
  } catch (error) {
    // Device table might not exist yet
    console.log('[Device]', device_hash.substring(0, 8) + '...', account_id || 'anonymous')
  }
}

/**
 * Get reward preview for a quiz (before playing)
 */
export async function getRewardPreview(
  quizId: string,
  device_hash?: string,
  account_id?: string | null
): Promise<{
  baseRewards: { coins: number; xp: number }
  possibleMultipliers: {
    firstTimeFullMarks: number
    firstTimePartial: number
    repeatFullMarks: number
    repeatPartial: number
  }
  isFirstTime: boolean
  potentialMaxReward: { coins: number; xp: number }
}> {
  const config = await getQuizRewardConfig(quizId)
  
  if (!config) {
    return {
      baseRewards: { coins: 0, xp: 0 },
      possibleMultipliers: {
        firstTimeFullMarks: 1,
        firstTimePartial: 1,
        repeatFullMarks: 1,
        repeatPartial: 1,
      },
      isFirstTime: true,
      potentialMaxReward: { coins: 0, xp: 0 },
    }
  }

  let isFirstTime = true
  if (device_hash) {
    const check = await checkCompletion(quizId, device_hash, account_id)
    isFirstTime = check.is_first_for_device || check.is_first_for_account
  }

  const firstTimeFullMarks = config.first_time_multiplier * config.full_marks_multiplier
  const firstTimePartial = config.first_time_multiplier
  const repeatFullMarks = config.full_marks_multiplier
  const repeatPartial = 1

  // Best possible reward
  const bestMultiplier = isFirstTime ? firstTimeFullMarks : repeatFullMarks

  return {
    baseRewards: {
      coins: config.reward_coins,
      xp: config.reward_xp,
    },
    possibleMultipliers: {
      firstTimeFullMarks,
      firstTimePartial,
      repeatFullMarks,
      repeatPartial,
    },
    isFirstTime,
    potentialMaxReward: {
      coins: Math.round(config.reward_coins * bestMultiplier),
      xp: Math.round(config.reward_xp * bestMultiplier),
    },
  }
}
