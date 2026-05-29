'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSarayaAccount, refreshSarayaAccount } from './saraya-account'
import { createAuthSupabaseClient } from './supabase-auth'

interface RewardStatus {
  dailyLoginClaimed: boolean
  articlesRead: number
  articlesCoinsEarned: number
  articleSlugs: string[]
  maxArticles: number
  maxArticleCoins: number
  dailyLoginReward: number
  articleReward: number
  streak: number
  multiplier: number
}

interface RewardNotification {
  id: string
  message: string
  coins: number
  type: 'daily' | 'article'
}

interface RewardContextType {
  status: RewardStatus | null
  loading: boolean
  notifications: RewardNotification[]
  claimDailyLogin: () => Promise<{ success: boolean; coinsEarned?: number }>
  claimArticleRead: (articleSlug: string) => Promise<{ success: boolean; coinsEarned?: number; alreadyRead?: boolean }>
  hasReadArticle: (articleSlug: string) => boolean
  dismissNotification: (id: string) => void
  refreshStatus: () => Promise<void>
}

const RewardContext = createContext<RewardContextType | null>(null)

export function useRewards() {
  const context = useContext(RewardContext)
  if (!context) {
    throw new Error('useRewards must be used within a RewardProvider')
  }
  return context
}

// Safe version that returns null if not in provider (useful for optional features)
export function useRewardsSafe(): RewardContextType | null {
  return useContext(RewardContext)
}

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = createAuthSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch {
    return null
  }
}

export function RewardProvider({ children }: { children: ReactNode }) {
  const { account } = useSarayaAccount()
  const [status, setStatus] = useState<RewardStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<RewardNotification[]>([])
  const [dailyLoginChecked, setDailyLoginChecked] = useState(false)

  // Fetch reward status
  const refreshStatus = useCallback(async () => {
    if (!account) {
      setStatus(null)
      return
    }

    try {
      const token = await getAuthToken()
      if (!token) return

      const response = await fetch('/api/rewards', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch reward status:', error)
    }
  }, [account])

  // Add notification
  const addNotification = useCallback((message: string, coins: number, type: 'daily' | 'article') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, coins, type }])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Claim daily login reward
  const claimDailyLogin = useCallback(async () => {
    if (!account) return { success: false }

    try {
      const token = await getAuthToken()
      if (!token) return { success: false }

      const response = await fetch('/api/rewards/daily-login', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        addNotification(
          `Dobrodošli! +${data.coinsEarned} novčića${data.multiplier > 1 ? ` (${data.multiplier}x streak bonus)` : ''}`,
          data.coinsEarned,
          'daily'
        )
        await refreshStatus()
        await refreshSarayaAccount()
        return { success: true, coinsEarned: data.coinsEarned }
      }

      return { success: false }
    } catch (error) {
      console.error('Failed to claim daily login:', error)
      return { success: false }
    }
  }, [account, addNotification, refreshStatus])

  // Claim article read reward
  const claimArticleRead = useCallback(async (articleSlug: string) => {
    if (!account) return { success: false }

    try {
      const token = await getAuthToken()
      if (!token) return { success: false }

      const response = await fetch('/api/rewards/article-read', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleSlug }),
      })

      const data = await response.json()

      if (data.success) {
        addNotification(
          `+${data.coinsEarned} novčića za čitanje članka${data.multiplier > 1 ? ` (${data.multiplier}x)` : ''} • ${data.articlesRead}/${data.maxArticles} članaka danas`,
          data.coinsEarned,
          'article'
        )
        await refreshStatus()
        await refreshSarayaAccount()
        return { success: true, coinsEarned: data.coinsEarned }
      }

      return { 
        success: false, 
        alreadyRead: data.alreadyRead,
        maxReached: data.maxReached 
      }
    } catch (error) {
      console.error('Failed to claim article read:', error)
      return { success: false }
    }
  }, [account, addNotification, refreshStatus])

  // Check if article was already read today
  const hasReadArticle = useCallback((articleSlug: string) => {
    return status?.articleSlugs?.includes(articleSlug) || false
  }, [status])

  // Initial load and auto-claim daily login
  useEffect(() => {
    if (account && !dailyLoginChecked) {
      setDailyLoginChecked(true)
      setLoading(true)
      
      // First fetch status, then check if daily login needs claiming
      refreshStatus().then(async () => {
        // Small delay to let status update
        setTimeout(async () => {
          const token = await getAuthToken()
          if (!token) {
            setLoading(false)
            return
          }

          const response = await fetch('/api/rewards', {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (response.ok) {
            const data = await response.json()
            if (!data.dailyLoginClaimed) {
              await claimDailyLogin()
            }
          }
          setLoading(false)
        }, 500)
      })
    }
  }, [account, dailyLoginChecked, refreshStatus, claimDailyLogin])

  // Reset daily check when account changes
  useEffect(() => {
    if (!account) {
      setDailyLoginChecked(false)
      setStatus(null)
    }
  }, [account])

  return (
    <RewardContext.Provider
      value={{
        status,
        loading,
        notifications,
        claimDailyLogin,
        claimArticleRead,
        hasReadArticle,
        dismissNotification,
        refreshStatus,
      }}
    >
      {children}
    </RewardContext.Provider>
  )
}
