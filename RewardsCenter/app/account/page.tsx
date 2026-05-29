'use client'

import { useEffect, useState, useMemo } from 'react'
import { ProfileCard } from "@/components/account/ProfileCard"
import { WalletCard } from "@/components/account/WalletCard"
import { TierProgress } from "@/components/account/TierProgress";
import { XPProgressCard } from "@/components/account/XPProgressCard";
import { AchievementsSection } from "@/components/account/AchievementsSection";
import { TransactionHistory } from "@/components/account/TransactionHistory";
import { AvatarCustomization } from "@/components/account/AvatarCustomization"
import { ReferralCard } from "@/components/account/ReferralCard"
import { AchievementCelebration } from "@/components/account/AchievementCelebration"

import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n"
import { AccountProfile, UserWallet, Achievement, Transaction } from "@/lib/types"
import { Loader2 } from 'lucide-react'

// Tier thresholds
const TIER_THRESHOLDS = {
  BRONZE: { min: 0, max: 50000 },
  SILVER: { min: 50000, max: 150000 },
  GOLD: { min: 150000, max: 350000 },
  PLATINUM: { min: 350000, max: 750000 },
  DIAMOND: { min: 750000, max: Infinity },
}

// Calculate tier from total earned
function calculateTier(totalEarned: number): { tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND', progress: number, nextThreshold: number } {
  for (const [tierName, { min, max }] of Object.entries(TIER_THRESHOLDS)) {
    if (totalEarned >= min && totalEarned < max) {
      return {
        tier: tierName as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND',
        progress: totalEarned,
        nextThreshold: max === Infinity ? totalEarned : max,
      }
    }
  }
  return { tier: 'BRONZE', progress: 0, nextThreshold: 50000 }
}

// Calculate XP progress
function calculateXPProgress(xp: number, level: number) {
  const xpPerLevel = 5000
  const xpForCurrentLevel = (level - 1) * xpPerLevel
  const xpInCurrentLevel = xp - xpForCurrentLevel
  const xpToNextLevel = xpPerLevel - xpInCurrentLevel
  
  return {
    currentXP: xpInCurrentLevel > 0 ? xpInCurrentLevel : xp,
    xpToNextLevel: xpToNextLevel > 0 ? xpToNextLevel : xpPerLevel,
    level,
  }
}

export default function AccountPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { t } = useTranslation()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [celebrationQueue, setCelebrationQueue] = useState<any[]>([])
  const [celebratingAchievement, setCelebratingAchievement] = useState<any>(null)
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalRedeemed: 0,
    ordersCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    rank: 0,
    percentile: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [joinedAt, setJoinedAt] = useState<string>(new Date().toISOString())

  // Fetch user data
  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // First, fetch orders to calculate totalEarned and tier
        const ordersRes = await fetch(`/api/orders?account_id=${user.id}&limit=10`)
        let totalEarned = user.coins || 0
        let currentTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' = 'BRONZE'
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          const orders = ordersData.data || []
          
          // Update transactions - map orders to Transaction type
          const mappedTransactions: Transaction[] = orders.map((order: any) => ({
            id: order.id,
            type: 'REDEEMED' as const,
            title: order.reward?.title || 'Reward Redemption',
            description: `${t.account.order} #${order.id.slice(0, 8)}...`,
            amount: -(order.total_price || 0),
            currency: (order.currency || 'COINS') as 'COINS' | 'TOKENS',
            timestamp: order.created_at || new Date().toISOString(),
          }))
          setTransactions(mappedTransactions)

          // Calculate stats from orders
          const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED')
          const totalRedeemed = completedOrders.reduce((sum: number, o: any) => sum + (o.price_paid || 0), 0)
          totalEarned = (user.coins || 0) + totalRedeemed
          
          // Calculate tier from totalEarned
          if (totalEarned >= 750000) currentTier = 'DIAMOND'
          else if (totalEarned >= 350000) currentTier = 'PLATINUM'
          else if (totalEarned >= 150000) currentTier = 'GOLD'
          else if (totalEarned >= 50000) currentTier = 'SILVER'
          else currentTier = 'BRONZE'
          
          setStats(prev => ({
            ...prev,
            totalRedeemed,
            ordersCompleted: completedOrders.length,
            totalEarned,
            currentStreak: 7, // TODO: Calculate from activity
            longestStreak: 21, // TODO: Calculate from activity
            rank: 142, // TODO: Get from leaderboard
            percentile: 8, // TODO: Calculate from leaderboard
          }))
        }

        // Now fetch achievements with tier info
        const achievementsUrl = new URL('/api/achievements/user', window.location.origin)
        achievementsUrl.searchParams.set('account_id', user.id)
        achievementsUrl.searchParams.set('level', String(user.level || 1))
        achievementsUrl.searchParams.set('xp', String(user.xp || 0))
        achievementsUrl.searchParams.set('coins', String(user.coins || 0))
        achievementsUrl.searchParams.set('tier', currentTier)
        achievementsUrl.searchParams.set('total_earned', String(totalEarned))
        // TODO: Add leaderboard_rank and leaderboard_total when available
        
        const achievementsRes = await fetch(achievementsUrl.toString())
        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json()
          // Map API achievements to the expected format
          const mappedAchievements: Achievement[] = (achievementsData.data || []).map((a: any) => ({
            id: a.code || a.id,
            title: a.title,
            description: a.description,
            icon: a.icon || '🏆',
            unlockedAt: a.unlockedAt || null,
            progress: a.progress,
            maxProgress: a.maxProgress,
          }))
          setAchievements(mappedAchievements)
          
          // Show celebration for newly unlocked achievements (only once per achievement)
          if (achievementsData.newlyUnlocked && achievementsData.newlyUnlocked.length > 0) {
            // Get list of achievements we've already celebrated (use code for stable tracking)
            const celebratedKey = `celebrated_achievements_${user.id}`
            const celebrated = JSON.parse(localStorage.getItem(celebratedKey) || '[]')
            
            // Find ALL achievements that haven't been celebrated yet
            const uncelebratedAchievements = achievementsData.newlyUnlocked.filter(
              (a: any) => !celebrated.includes(a.code || a.id)
            )
            
            if (uncelebratedAchievements.length > 0) {
              // Queue all uncelebrated achievements
              setCelebrationQueue(uncelebratedAchievements)
              // Show the first one immediately
              setCelebratingAchievement(uncelebratedAchievements[0])
              // Mark first one as celebrated
              const firstKey = uncelebratedAchievements[0].code || uncelebratedAchievements[0].id
              localStorage.setItem(celebratedKey, JSON.stringify([...celebrated, firstKey]))
            }
          }
        }

        // Get joined date from stored user data or use a default
        const storedUser = localStorage.getItem('saraya_rewards_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          if (userData.created_at) {
            setJoinedAt(userData.created_at)
          }
        }

      } catch (error) {
        console.error('Error fetching account data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Build wallet from auth context
  const wallet: UserWallet = useMemo(() => ({
    coins: user?.coins || 0,
    tokens: user?.tokens || 0,
    xp: user?.xp || 0,
    level: user?.level || 1,
  }), [user])

  const { tier, progress: tierProgress, nextThreshold: tierNextThreshold } = useMemo(
    () => calculateTier(stats.totalEarned), 
    [stats.totalEarned]
  )

  const xpProgress = useMemo(
    () => calculateXPProgress(user?.xp || 0, user?.level || 1),
    [user?.xp, user?.level]
  )

  const profile: AccountProfile = useMemo(() => ({
    name: user?.name || 'Guest',
    handle: user ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@guest',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || '/default-avatar.svg',
    notifications: 0,
    tier,
    tierProgress,
    tierNextThreshold,
    xpProgress,
    joinedAt,
    stats,
    achievements,
    recentTransactions: transactions,
  }), [user, tier, tierProgress, tierNextThreshold, xpProgress, joinedAt, stats, achievements, transactions])

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-white/60">Loading your profile...</p>
        </div>
      </section>
    )
  }

  // Show message if not logged in
  if (!user) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Not Logged In</h2>
          <p className="text-white/60">Please log in to view your account.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4 sm:gap-6">
      {/* Top section - Profile and Wallet */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4 sm:gap-6">
          <ProfileCard profile={profile} />
          <ReferralCard />
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
          <WalletCard wallet={wallet} />
          <XPProgressCard xpProgress={xpProgress} />
          <TierProgress profile={profile} />
        </div>
      </div>

      {/* Avatar Customization */}
      <AvatarCustomization />

      {/* Bottom section - Achievements and Transactions */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <AchievementsSection achievements={achievements} />
        <TransactionHistory transactions={transactions} />
      </div>

      {/* Achievement Celebration Modal */}
      <AchievementCelebration 
        achievement={celebratingAchievement}
        onClose={() => {
          // Remove the current achievement from queue and show next one
          const remainingQueue = celebrationQueue.slice(1)
          setCelebrationQueue(remainingQueue)
          
          if (remainingQueue.length > 0) {
            // Show next achievement after a small delay for better UX
            setTimeout(() => {
              setCelebratingAchievement(remainingQueue[0])
              // Mark as celebrated
              if (user?.id) {
                const celebratedKey = `celebrated_achievements_${user.id}`
                const celebrated = JSON.parse(localStorage.getItem(celebratedKey) || '[]')
                const achievementKey = remainingQueue[0].code || remainingQueue[0].id
                if (!celebrated.includes(achievementKey)) {
                  localStorage.setItem(celebratedKey, JSON.stringify([...celebrated, achievementKey]))
                }
              }
            }, 300)
          } else {
            setCelebratingAchievement(null)
          }
        }}
      />
    </section>
  )
}
