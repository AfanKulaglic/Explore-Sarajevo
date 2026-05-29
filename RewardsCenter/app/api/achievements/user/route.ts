import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  asAccountRecord,
  getAccountStatsSnapshot,
} from '@/lib/account-api'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

// CORS headers for cross-origin requests from other Saraya apps
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * GET /api/achievements/user?account_id= - Get achievements for a specific user
 */

// Achievement definitions with requirements (these should match the achievements table codes)
// Also include common variations
const ACHIEVEMENT_REQUIREMENTS: Record<string, { type: string, value: number | string }> = {
  // Shopping/Spending achievements (UPPERCASE from DB)
  'FIRST_PURCHASE': { type: 'orders', value: 1 },
  'first_purchase': { type: 'orders', value: 1 },
  'BIG_SPENDER': { type: 'coins_spent', value: 10000 },
  'big_spender': { type: 'coins_spent', value: 10000 },
  'LOYAL_CUSTOMER': { type: 'orders', value: 5 },
  'loyal_customer': { type: 'orders', value: 5 },
  'SHOPPING_SPREE': { type: 'orders', value: 10 },
  'shopping_spree': { type: 'orders', value: 10 },
  
  // Level/XP achievements
  'RISING_STAR': { type: 'level', value: 5 },
  'rising_star': { type: 'level', value: 5 },
  'XP_HUNTER': { type: 'xp', value: 5000 },
  'xp_hunter': { type: 'xp', value: 5000 },
  'XP_MASTER': { type: 'xp', value: 25000 },
  'xp_master': { type: 'xp', value: 25000 },
  'LEVEL_UP': { type: 'level', value: 2 },
  'level_up': { type: 'level', value: 2 },
  'LEVEL_5': { type: 'level', value: 5 },
  'level_5': { type: 'level', value: 5 },
  'LEVEL_10': { type: 'level', value: 10 },
  'level_10': { type: 'level', value: 10 },
  
  // Social achievements
  'SOCIAL_BUTTERFLY': { type: 'friends', value: 3 },
  'social_butterfly': { type: 'friends', value: 3 },
  'FIRST_FRIEND': { type: 'friends', value: 1 },
  'first_friend': { type: 'friends', value: 1 },
  'ADD_3_FRIENDS': { type: 'friends', value: 3 },
  'add_3_friends': { type: 'friends', value: 3 },
  'POPULAR': { type: 'friends', value: 10 },
  'popular': { type: 'friends', value: 10 },
  
  // Tournament achievements
  'TOURNAMENT_ROOKIE': { type: 'tournaments_joined', value: 1 },
  'tournament_rookie': { type: 'tournaments_joined', value: 1 },
  'FIRST_TOURNAMENT': { type: 'tournaments_joined', value: 1 },
  'first_tournament': { type: 'tournaments_joined', value: 1 },
  
  // Coin achievements
  'COIN_COLLECTOR': { type: 'coins_balance', value: 5000 },
  'coin_collector': { type: 'coins_balance', value: 5000 },
  'WEALTH_BUILDER': { type: 'coins_balance', value: 50000 },
  'wealth_builder': { type: 'coins_balance', value: 50000 },
  'RICH': { type: 'coins_balance', value: 100000 },
  'rich': { type: 'coins_balance', value: 100000 },
  'MILLIONAIRE': { type: 'coins_balance', value: 1000000 },
  'millionaire': { type: 'coins_balance', value: 1000000 },
  
  // Tier achievements - value is the tier name
  'TIER_SILVER': { type: 'tier', value: 'SILVER' },
  'tier_silver': { type: 'tier', value: 'SILVER' },
  'TIER_GOLD': { type: 'tier', value: 'GOLD' },
  'tier_gold': { type: 'tier', value: 'GOLD' },
  'TIER_PLATINUM': { type: 'tier', value: 'PLATINUM' },
  'tier_platinum': { type: 'tier', value: 'PLATINUM' },
  'TIER_DIAMOND': { type: 'tier', value: 'DIAMOND' },
  'tier_diamond': { type: 'tier', value: 'DIAMOND' },
  
  // Leaderboard achievements - value is the percentile threshold
  'TOP_10_PERCENT': { type: 'leaderboard_percentile', value: 10 },
  'top_10_percent': { type: 'leaderboard_percentile', value: 10 },
  'TOP_1_PERCENT': { type: 'leaderboard_percentile', value: 1 },
  'top_1_percent': { type: 'leaderboard_percentile', value: 1 },
  
  // Streak achievements - daily login streak
  'STREAK_STARTER': { type: 'streak', value: 7 },
  'streak_starter': { type: 'streak', value: 7 },
  'STREAK_MASTER': { type: 'streak', value: 30 },
  'streak_master': { type: 'streak', value: 30 },
}

// Tier order for comparison
const TIER_ORDER: Record<string, number> = {
  'BRONZE': 1,
  'SILVER': 2,
  'GOLD': 3,
  'PLATINUM': 4,
  'DIAMOND': 5,
}

// Category-based fallback requirements
const CATEGORY_REQUIREMENTS: Record<string, { type: string }> = {
  'SPENDING': { type: 'orders' },
  'spending': { type: 'orders' },
  'SHOPPING': { type: 'orders' },
  'shopping': { type: 'orders' },
  'SOCIAL': { type: 'friends' },
  'social': { type: 'friends' },
  'LEVELING': { type: 'xp' },
  'leveling': { type: 'xp' },
  'EARNING': { type: 'coins_balance' },
  'earning': { type: 'coins_balance' },
  'TOURNAMENT': { type: 'tournaments_joined' },
  'tournament': { type: 'tournaments_joined' },
  'TOURNAMENTS': { type: 'tournaments_joined' },
  'tournaments': { type: 'tournaments_joined' },
  'STREAK': { type: 'streak' }, // Daily login streak
  'streak': { type: 'streak' },
  'MILESTONE': { type: 'milestone' },
  'milestone': { type: 'milestone' },
}

// Get user stats from central API
async function getUserStats(accountId: string) {
  try {
    // Try direct account fetch first
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
      headers: { 'x-admin-email': ADMIN_EMAIL }
    })
    
    if (response.ok) {
      const data = await response.json()
      const account = data.data || data
      
      if (account) {
        const stats = getAccountStatsSnapshot(asAccountRecord(account))
        console.log('User stats from central API:', stats)
        return stats
      }
    }
    
    // Fallback: search by ID
    const searchResponse = await fetch(`${CENTRAL_API_URL}/api/accounts?search=${accountId}`, {
      headers: { 'x-admin-email': ADMIN_EMAIL }
    })
    
    if (searchResponse.ok) {
      const data = await searchResponse.json()
      const accounts = data.data || []
      const account = accounts.find((a: any) => a.id === accountId)
      
      if (account) {
        return getAccountStatsSnapshot(asAccountRecord(account))
      }
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
  }
  return { level: 1, xp: 0, coins_balance: 0 }
}

// Get order stats from database
async function getOrderStats(accountId: string) {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('reward_orders')
      .select('total_price, unit_price, status, currency')
      .eq('account_id', accountId)
    
    if (error) {
      console.error('Error fetching orders:', error)
      return { orders: 0, completed_orders: 0, coins_spent: 0 }
    }
    
    console.log('Orders found for user:', orders?.length)
    
    // Count all orders (any status counts as having placed an order)
    const allOrders = orders || []
    
    // Completed orders are those that are APPROVED or FULFILLED (not DENIED/CANCELLED)
    const completedOrders = allOrders.filter(o => 
      ['APPROVED', 'FULFILLED', 'PENDING'].includes(o.status)
    )
    
    // Calculate total coins spent (total_price is the amount spent)
    const totalSpent = allOrders
      .filter(o => o.currency === 'COINS' && !['DENIED', 'CANCELLED'].includes(o.status))
      .reduce((sum, o) => sum + (o.total_price || 0), 0)
    
    console.log('Order stats:', { 
      total: allOrders.length, 
      completed: completedOrders.length, 
      coinsSpent: totalSpent 
    })
    
    return {
      orders: allOrders.length,
      completed_orders: completedOrders.length,
      coins_spent: totalSpent,
    }
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return { orders: 0, completed_orders: 0, coins_spent: 0 }
  }
}

// Get friend count
async function getFriendCount(accountId: string) {
  try {
    const { data: friendships } = await supabaseAdmin
      .from('friendships')
      .select('id')
      .not('accepted_at', 'is', null)
      .or(`requester_id.eq.${accountId},addressee_id.eq.${accountId}`)
    
    return friendships?.length || 0
  } catch (error) {
    console.error('Error fetching friend count:', error)
    return 0
  }
}

// Get tournament participation
async function getTournamentStats(accountId: string) {
  try {
    const { data: participants } = await supabaseAdmin
      .from('tournament_participants')
      .select('id')
      .eq('account_id', accountId)
    
    return { tournaments_joined: participants?.length || 0 }
  } catch (error) {
    console.error('Error fetching tournament stats:', error)
    return { tournaments_joined: 0 }
  }
}

// Helper functions for streak calculation
function getTodayCET(): string {
  const now = new Date()
  const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  const year = cetDate.getFullYear()
  const month = String(cetDate.getMonth() + 1).padStart(2, '0')
  const day = String(cetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getYesterdayCET(): string {
  const now = new Date()
  const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  cetDate.setDate(cetDate.getDate() - 1)
  const year = cetDate.getFullYear()
  const month = String(cetDate.getMonth() + 1).padStart(2, '0')
  const day = String(cetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Calculate daily login streak
async function getStreakStats(accountId: string) {
  try {
    // Get all claims for this user, ordered by date descending
    const { data: claims, error } = await supabaseAdmin
      .from('daily_rewards')
      .select('claim_date')
      .eq('account_id', accountId)
      .order('claim_date', { ascending: false })
      .limit(100)

    if (error || !claims || claims.length === 0) {
      return { streak: 0 }
    }

    const todayCET = getTodayCET()
    const yesterdayCET = getYesterdayCET()
    
    // Check if user claimed today or yesterday (streak continues if they claimed yesterday but not today yet)
    const firstClaim = claims[0].claim_date
    if (firstClaim !== todayCET && firstClaim !== yesterdayCET) {
      // Streak is broken - last claim was more than 1 day ago
      return { streak: 0 }
    }

    // Count consecutive days
    let streak = 0
    let expectedDate = firstClaim === todayCET ? todayCET : yesterdayCET
    
    for (const claim of claims) {
      if (claim.claim_date === expectedDate) {
        streak++
        // Calculate previous day
        const date = new Date(expectedDate + 'T12:00:00Z')
        date.setDate(date.getDate() - 1)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        expectedDate = `${year}-${month}-${day}`
      } else if (claim.claim_date < expectedDate) {
        // Gap found, streak ends
        break
      }
    }

    return { streak }
  } catch (error) {
    console.error('Error fetching streak stats:', error)
    return { streak: 0 }
  }
}

// Get current value for a specific stat type
function getStatValue(type: string, stats: any): number {
  switch (type) {
    case 'orders':
      return stats.orders || 0
    case 'coins_spent':
      return stats.coins_spent || 0
    case 'level':
      return stats.level || 0
    case 'xp':
      return stats.xp || 0
    case 'friends':
      return stats.friends || 0
    case 'tournaments_joined':
      return stats.tournaments_joined || 0
    case 'coins_balance':
      return stats.coins_balance || 0
    case 'streak':
      return stats.streak || 0
    default:
      return 0
  }
}

// Check if achievement requirement is met
function checkAchievementProgress(
  code: string, 
  category: string | null,
  threshold: number | null, 
  stats: any
): { unlocked: boolean, progress: number, maxProgress: number } {
  // First try exact code match
  let requirement = ACHIEVEMENT_REQUIREMENTS[code]
  
  // Try lowercase version
  if (!requirement && code) {
    requirement = ACHIEVEMENT_REQUIREMENTS[code.toLowerCase()]
  }
  
  // Try with underscores instead of hyphens
  if (!requirement && code) {
    requirement = ACHIEVEMENT_REQUIREMENTS[code.toLowerCase().replace(/-/g, '_')]
  }
  
  // Try with hyphens instead of underscores
  if (!requirement && code) {
    requirement = ACHIEVEMENT_REQUIREMENTS[code.toLowerCase().replace(/_/g, '-')]
  }
  
  // If we have a matching requirement, use it
  if (requirement) {
    const { type, value } = requirement
    
    // Handle tier-based achievements
    if (type === 'tier') {
      const userTier = stats.tier || 'BRONZE'
      const userTierOrder = TIER_ORDER[userTier] || 1
      const requiredTierOrder = TIER_ORDER[value as string] || 1
      const unlocked = userTierOrder >= requiredTierOrder
      
      return {
        unlocked,
        progress: unlocked ? 1 : 0,
        maxProgress: 1,
      }
    }
    
    // Handle leaderboard percentile achievements
    if (type === 'leaderboard_percentile') {
      const userPercentile = stats.leaderboard_percentile || 100 // 100 = worst (not in leaderboard)
      const requiredPercentile = value as number
      const unlocked = userPercentile <= requiredPercentile
      
      return {
        unlocked,
        progress: unlocked ? 1 : 0,
        maxProgress: 1,
      }
    }
    
    // Handle regular numeric achievements
    const currentValue = getStatValue(type, stats)
    const numValue = typeof value === 'number' ? value : 0
    
    return {
      unlocked: currentValue >= numValue,
      progress: Math.min(currentValue, numValue),
      maxProgress: numValue,
    }
  }
  
  // Fallback: Use category to determine stat type
  if (category) {
    const categoryReq = CATEGORY_REQUIREMENTS[category] || CATEGORY_REQUIREMENTS[category.toLowerCase()]
    if (categoryReq && threshold) {
      const currentValue = getStatValue(categoryReq.type, stats)
      return {
        unlocked: currentValue >= threshold,
        progress: Math.min(currentValue, threshold),
        maxProgress: threshold,
      }
    }
  }
  
  // Last resort: Use threshold from DB if available
  const maxProgress = threshold || 1
  
  // Only log truly unknown achievements (skip expected ones that we can't track yet)
  const knownUntrackable = ['TOURNAMENT_FIRST', 'TOURNAMENT_WINNER']
  const isExpectedUntrackable = knownUntrackable.some(prefix => 
    code.toUpperCase().includes(prefix)
  )
  
  if (!isExpectedUntrackable) {
    console.log(`Unknown achievement code: ${code}, category: ${category}, threshold: ${threshold}`)
  }
  
  return { unlocked: false, progress: 0, maxProgress }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')
    
    // Accept user stats from query params (from auth context)
    const userLevel = searchParams.get('level')
    const userXp = searchParams.get('xp')
    const userCoins = searchParams.get('coins')
    const userTier = searchParams.get('tier') // e.g., 'BRONZE', 'SILVER', 'GOLD', etc.
    const userTotalEarned = searchParams.get('total_earned') // For tier calculation
    const userLeaderboardRank = searchParams.get('leaderboard_rank') // User's position
    const userLeaderboardTotal = searchParams.get('leaderboard_total') // Total users

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400, headers: corsHeaders })
    }

    // Fetch achievements from database
    const { data: dbAchievements, error: achievementsError } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true })
    
    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
    }

    // Fetch all stats in parallel
    const [centralStats, orderStats, friendCount, tournamentStats, streakStats] = await Promise.all([
      getUserStats(accountId),
      getOrderStats(accountId),
      getFriendCount(accountId),
      getTournamentStats(accountId),
      getStreakStats(accountId),
    ])

    // Use query params if provided (more up-to-date), otherwise use central API
    const userStats = {
      level: userLevel ? parseInt(userLevel) : centralStats.level,
      xp: userXp ? parseInt(userXp) : centralStats.xp,
      coins_balance: userCoins ? parseInt(userCoins) : centralStats.coins_balance,
    }

    // Calculate tier from total earned if provided
    let tier = userTier || 'BRONZE'
    if (!userTier && userTotalEarned) {
      const totalEarned = parseInt(userTotalEarned)
      if (totalEarned >= 750000) tier = 'DIAMOND'
      else if (totalEarned >= 350000) tier = 'PLATINUM'
      else if (totalEarned >= 150000) tier = 'GOLD'
      else if (totalEarned >= 50000) tier = 'SILVER'
      else tier = 'BRONZE'
    }
    
    // If still no tier, calculate from coins_balance (approximation)
    if (!userTier && !userTotalEarned) {
      const coinsTotal = userStats.coins_balance + orderStats.coins_spent
      if (coinsTotal >= 750000) tier = 'DIAMOND'
      else if (coinsTotal >= 350000) tier = 'PLATINUM'
      else if (coinsTotal >= 150000) tier = 'GOLD'
      else if (coinsTotal >= 50000) tier = 'SILVER'
      else tier = 'BRONZE'
    }
    
    // Calculate leaderboard percentile if rank and total provided
    let leaderboardPercentile = 100 // Default: not in top percentile
    if (userLeaderboardRank && userLeaderboardTotal) {
      const rank = parseInt(userLeaderboardRank)
      const total = parseInt(userLeaderboardTotal)
      if (total > 0 && rank > 0) {
        leaderboardPercentile = (rank / total) * 100
      }
    }

    // Combine all stats
    const allStats = {
      ...userStats,
      ...orderStats,
      friends: friendCount,
      ...tournamentStats,
      ...streakStats,
      tier,
      leaderboard_percentile: leaderboardPercentile,
    }
    
    console.log('Achievement stats for user:', accountId, allStats)

    // Check for level up - compare with stored level
    const { data: storedStats } = await supabaseAdmin
      .from('user_stats')
      .select('account_id')
      .eq('account_id', accountId)
      .single()

    // Upsert user stats to track last known values
    const { data: prevStats } = await supabaseAdmin
      .from('user_stats')
      .select('account_id')
      .eq('account_id', accountId)
      .single()

    // We'll check for level up via last_level_notification field
    const { data: lastLevelNotif } = await supabaseAdmin
      .from('notifications')
      .select('id, data')
      .eq('account_id', accountId)
      .eq('type', 'LEVEL_UP')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastNotifiedLevel = lastLevelNotif?.data?.level || 0
    const currentLevel = userStats.level || 1

    // Create level up notification if level increased since last notification
    if (currentLevel > lastNotifiedLevel && currentLevel > 1) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          account_id: accountId,
          type: 'LEVEL_UP',
          title: 'Level Up!',
          body: `Congratulations! You reached Level ${currentLevel}!`,
          data: {
            level: currentLevel,
            previous_level: lastNotifiedLevel || currentLevel - 1
          }
        })
    }

    // Get user's achievement progress from database
    const { data: userAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id, progress, max_progress, unlocked_at')
      .eq('account_id', accountId)

    const userAchievementMap = new Map(
      (userAchievements || []).map(ua => [ua.achievement_id, ua])
    )

    // Track newly unlocked achievements for celebration
    const newlyUnlocked: any[] = []

    // Map achievements with progress
    const achievements = (dbAchievements || []).map(achievement => {
      const userAchievement = userAchievementMap.get(achievement.id)
      const previouslyUnlockedAt = userAchievement?.unlocked_at
      
      // Use code or slug depending on what the database provides
      const achievementCode = achievement.code || achievement.slug || ''
      
      // Check progress based on achievement code and category
      const { unlocked, progress, maxProgress } = checkAchievementProgress(
        achievementCode, 
        achievement.category,
        achievement.threshold || achievement.requirement_value,
        allStats
      )
      
      const isNewlyUnlocked = unlocked && !previouslyUnlockedAt
      
      const achievementData = {
        id: achievement.id,
        code: achievementCode,
        title: achievement.title || achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        xpReward: achievement.xp_reward,
        coinReward: achievement.coins_reward || achievement.coins_reward,
        tokenReward: achievement.tokens_reward || achievement.tokens_reward,
        unlockedAt: previouslyUnlockedAt || (unlocked ? new Date().toISOString() : null),
        progress: unlocked ? maxProgress : progress,
        maxProgress,
        isNew: isNewlyUnlocked,
      }
      
      if (isNewlyUnlocked) {
        newlyUnlocked.push(achievementData)
      }
      
      return achievementData
    })

    // Auto-unlock newly completed achievements in database
    for (const achievement of newlyUnlocked) {
      const existing = userAchievementMap.get(achievement.id)
      
      if (existing) {
        // Update existing record
        await supabaseAdmin
          .from('user_achievements')
          .update({
            progress: achievement.maxProgress,
            unlocked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('account_id', accountId)
          .eq('achievement_id', achievement.id)
      } else {
        // Insert new record
        await supabaseAdmin
          .from('user_achievements')
          .insert({
            account_id: accountId,
            achievement_id: achievement.id,
            progress: achievement.maxProgress,
            max_progress: achievement.maxProgress,
            unlocked_at: new Date().toISOString(),
          })
      }

      // Create notification for newly unlocked achievement
      await supabaseAdmin
        .from('notifications')
        .insert({
          account_id: accountId,
          type: 'ACHIEVEMENT',
          title: 'Achievement Unlocked!',
          body: `You earned "${achievement.title}"${achievement.coinReward ? ` and received ${achievement.coinReward.toLocaleString()} coins!` : '!'}`,
          data: {
            achievement_id: achievement.id,
            achievement_code: achievement.code,
            achievement_title: achievement.title,
            coins_reward: achievement.coinReward,
            xp_reward: achievement.xpReward,
          }
        })
    }

    return NextResponse.json({ 
      data: achievements,
      stats: allStats,
      newlyUnlocked,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in GET /api/achievements/user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}
