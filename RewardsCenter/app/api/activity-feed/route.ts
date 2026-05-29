import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'https://accounts.saraya.solutions'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

// Gradient colors for different activity types
const GRADIENTS = {
  achievement: [
    { from: '#8b5cf6', to: '#f97316' }, // purple to orange
    { from: '#ec4899', to: '#8b5cf6' }, // pink to purple
    { from: '#06b6d4', to: '#3b82f6' }, // cyan to blue
    { from: '#10b981', to: '#06b6d4' }, // emerald to cyan
    { from: '#f59e0b', to: '#ef4444' }, // amber to red
  ],
  redemption: [
    { from: '#0f172a', to: '#1e3a8a' }, // dark blue
    { from: '#1e293b', to: '#334155' }, // slate
    { from: '#312e81', to: '#4c1d95' }, // indigo to purple
    { from: '#164e63', to: '#0e7490' }, // dark cyan
    { from: '#1e3a5f', to: '#3b82f6' }, // dark to blue
  ],
}

// Cache for all accounts (keyed by account ID)
let accountsCache: Map<string, { name: string; avatar: string }> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Fetch all accounts from central API and cache them
async function loadAllAccounts() {
  const now = Date.now()
  
  // Return cached data if still valid
  if (accountsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return accountsCache
  }
  
  try {
    // Fetch accounts with a large limit to get all users
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts?limit=1000`, {
      headers: { 'x-admin-email': ADMIN_EMAIL }
    })
    
    if (response.ok) {
      const data = await response.json()
      const accounts = data.data || []
      
      // Build cache map keyed by account ID
      accountsCache = new Map()
      for (const account of accounts) {
        const name = account.name || 'Unknown User'
        accountsCache.set(account.id, {
          name,
          avatar: account.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`,
        })
      }
      cacheTimestamp = now
      console.log(`Loaded ${accountsCache.size} accounts into cache`)
    }
  } catch (error) {
    console.error('Error fetching accounts:', error)
  }
  
  if (!accountsCache) {
    accountsCache = new Map()
  }
  
  return accountsCache
}

async function getUserInfo(accountId: string) {
  const cache = await loadAllAccounts()
  
  if (cache.has(accountId)) {
    return cache.get(accountId)!
  }
  
  // Fallback for unknown users
  return {
    name: 'User',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=6366f1`,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Fetch recent unlocked achievements
    const { data: recentAchievements, error: achievementsError } = await supabaseAdmin
      .from('user_achievements')
      .select(`
        id,
        account_id,
        achievement_id,
        unlocked_at,
        rewards_achievements (
          id,
          code,
          title,
          description,
          icon,
          xp_reward,
          coins_reward
        )
      `)
      .not('unlocked_at', 'is', null)
      .order('unlocked_at', { ascending: false })
      .limit(limit)

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
    }

    // Fetch recent completed orders (redemptions)
    const { data: recentOrders, error: ordersError } = await supabaseAdmin
      .from('reward_orders')
      .select(`
        id,
        account_id,
        reward_id,
        total_price,
        status,
        created_at,
        rewards (
          id,
          name,
          title,
          image_url
        )
      `)
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
    }

    // Combine and format activities
    const activities: any[] = []

    // Process achievements
    if (recentAchievements) {
      for (const ua of recentAchievements) {
        const achievement = ua.rewards_achievements as any
        if (!achievement) continue
        
        const userInfo = await getUserInfo(ua.account_id)
        const gradientIndex = Math.floor(Math.random() * GRADIENTS.achievement.length)
        const gradient = GRADIENTS.achievement[gradientIndex]
        
        activities.push({
          id: `ach-${ua.id}`,
          type: 'ACHIEVEMENT',
          userName: userInfo.name,
          userAvatar: userInfo.avatar,
          title: `${achievement.icon || '🏆'} ${achievement.title}`,
          subtitle: achievement.description,
          xpEarned: achievement.xp_reward || 0,
          coins: achievement.coins_reward || 0,
          timestamp: ua.unlocked_at,
          gradientFrom: gradient.from,
          gradientTo: gradient.to,
        })
      }
    }

    // Process orders (redemptions)
    if (recentOrders) {
      for (const order of recentOrders) {
        const reward = order.rewards as any
        if (!reward) continue
        
        const userInfo = await getUserInfo(order.account_id)
        const gradientIndex = Math.floor(Math.random() * GRADIENTS.redemption.length)
        const gradient = GRADIENTS.redemption[gradientIndex]
        
        activities.push({
          id: `order-${order.id}`,
          type: 'REDEMPTION',
          userName: userInfo.name,
          userAvatar: userInfo.avatar,
          title: `Redeemed ${reward.title || reward.name}`,
          subtitle: `${order.total_price?.toLocaleString() || 0} coins`,
          coins: order.total_price || 0,
          timestamp: order.created_at,
          gradientFrom: gradient.from,
          gradientTo: gradient.to,
        })
      }
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return only the requested limit
    const limitedActivities = activities.slice(0, limit)

    return NextResponse.json({ 
      data: limitedActivities,
      total: activities.length 
    })

  } catch (error) {
    console.error('Error in GET /api/activity-feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
