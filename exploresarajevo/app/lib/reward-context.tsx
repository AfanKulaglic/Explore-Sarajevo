'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

function safeRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// Reward configuration
export const REWARDS_CONFIG = {
  DAILY_LOGIN: 300,
  PREMIUM_ITEM: 200,
  HIGHLIGHTED_ITEM: 100,
  REGULAR_ITEM: 50,
  MAX_DAILY_ITEM_COINS: 1700,
}

interface RewardStatus {
  authenticated: boolean
  dailyLoginClaimed: boolean
  itemsRead: number
  itemsCoinsEarned: number
  maxItemCoins: number
  remainingCoins: number
  itemSlugs: string[]
  streak: number
  multiplier: number
  loading: boolean
  error: string | null
}

interface RewardNotification {
  id: string
  type: 'daily-login' | 'item-read'
  coins: number
  message: string
  tier?: string
  streak?: number
  multiplier?: number
  dailyProgress?: number
  dailyMax?: number
}

interface RewardContextType {
  status: RewardStatus
  notifications: RewardNotification[]
  refreshStatus: () => Promise<void>
  claimDailyLogin: () => Promise<{ success: boolean; coins?: number }>
  claimItemRead: (itemSlug: string, itemType: 'business' | 'attraction', tier: 'premium' | 'highlighted' | 'regular') => Promise<{ success: boolean; coins?: number; alreadyRead?: boolean; maxReached?: boolean; error?: string }>
  hasReadItem: (itemSlug: string, itemType: 'business' | 'attraction') => boolean
  dismissNotification: (id: string) => void
  canEarnMore: boolean
}

const RewardContext = createContext<RewardContextType | null>(null)

export function useRewards() {
  const context = useContext(RewardContext)
  if (!context) {
    throw new Error('useRewards must be used within a RewardProvider')
  }
  return context
}

interface RewardProviderProps {
  children: ReactNode
  authToken: string | null
}

export function RewardProvider({ children, authToken }: RewardProviderProps) {
  const [status, setStatus] = useState<RewardStatus>({
    authenticated: false,
    dailyLoginClaimed: false,
    itemsRead: 0,
    itemsCoinsEarned: 0,
    maxItemCoins: REWARDS_CONFIG.MAX_DAILY_ITEM_COINS,
    remainingCoins: REWARDS_CONFIG.MAX_DAILY_ITEM_COINS,
    itemSlugs: [],
    streak: 0,
    multiplier: 1.0,
    loading: true,
    error: null,
  })
  const [notifications, setNotifications] = useState<RewardNotification[]>([])

  const refreshStatus = useCallback(async () => {
    if (!authToken) {
      setStatus(prev => ({ ...prev, loading: false, authenticated: false }))
      return
    }

    try {
      const response = await fetch('/api/rewards', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch reward status')
      }

      const data = await response.json()
      setStatus({
        authenticated: true,
        dailyLoginClaimed: data.dailyLoginClaimed,
        itemsRead: data.itemsRead,
        itemsCoinsEarned: data.itemsCoinsEarned,
        maxItemCoins: data.maxItemCoins,
        remainingCoins: data.remainingCoins,
        itemSlugs: data.itemSlugs || [],
        streak: data.streak || 0,
        multiplier: data.multiplier || 1.0,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Failed to refresh reward status:', error)
      setStatus(prev => ({ ...prev, loading: false, authenticated: !!authToken, error: 'Failed to load rewards' }))
    }
  }, [authToken])

  // Load status on mount and when auth changes
  useEffect(() => {
    if (authToken) {
      refreshStatus()
    } else {
      setStatus(prev => ({ ...prev, loading: false, authenticated: false }))
    }
  }, [authToken, refreshStatus])

  const claimDailyLogin = useCallback(async (): Promise<{ success: boolean; coins?: number }> => {
    if (!authToken) return { success: false }

    try {
      const response = await fetch('/api/rewards/daily-login', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        // Add notification
        const notification: RewardNotification = {
          id: safeRandomId(),
          type: 'daily-login',
          coins: data.coinsEarned,
          message: `Daily login reward! +${data.coinsEarned} coins`,
          streak: data.streak,
          multiplier: data.multiplier,
        }
        setNotifications(prev => [...prev, notification])

        // Update status
        setStatus(prev => ({
          ...prev,
          dailyLoginClaimed: true,
          streak: data.streak,
          multiplier: data.multiplier,
        }))

        return { success: true, coins: data.coinsEarned }
      }

      return { success: false }
    } catch (error) {
      console.error('Failed to claim daily login:', error)
      return { success: false }
    }
  }, [authToken])

  const claimItemRead = useCallback(async (
    itemSlug: string,
    itemType: 'business' | 'attraction',
    tier: 'premium' | 'highlighted' | 'regular'
  ): Promise<{ success: boolean; coins?: number; alreadyRead?: boolean; maxReached?: boolean; error?: string }> => {
    if (!authToken) return { success: false, error: 'Not signed in' }

    try {
      const response = await fetch('/api/rewards/item-read', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemSlug, itemType, tier }),
      })

      const data = await response.json()

      if (data.success) {
        // Add notification
        const notification: RewardNotification = {
          id: safeRandomId(),
          type: 'item-read',
          coins: data.coinsEarned,
          message: `+${data.coinsEarned} coins!`,
          tier,
          streak: data.streak,
          multiplier: data.multiplier,
          dailyProgress: data.itemsCoinsEarned,
          dailyMax: data.maxItemCoins,
        }
        setNotifications(prev => [...prev, notification])

        // Update status
        setStatus(prev => ({
          ...prev,
          itemsRead: data.itemsRead,
          itemsCoinsEarned: data.itemsCoinsEarned,
          remainingCoins: data.remainingCoins,
          itemSlugs: [...prev.itemSlugs, `${itemType}:${itemSlug}`],
        }))

        return { success: true, coins: data.coinsEarned }
      }

      return {
        success: false,
        alreadyRead: data.alreadyRead,
        maxReached: data.maxReached,
        error: data.error || 'Claim failed',
      }
    } catch (error) {
      console.error('Failed to claim item read:', error)
      return { success: false, error: 'Network error' }
    }
  }, [authToken])

  const hasReadItem = useCallback((itemSlug: string, itemType: 'business' | 'attraction'): boolean => {
    const itemKey = `${itemType}:${itemSlug}`
    return status.itemSlugs.includes(itemKey)
  }, [status.itemSlugs])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const canEarnMore = status.itemsCoinsEarned < status.maxItemCoins

  return (
    <RewardContext.Provider
      value={{
        status,
        notifications,
        refreshStatus,
        claimDailyLogin,
        claimItemRead,
        hasReadItem,
        dismissNotification,
        canEarnMore,
      }}
    >
      {children}
    </RewardContext.Provider>
  )
}

// Notification component to show reward popups
export function RewardNotifications() {
  const { notifications, dismissNotification } = useRewards()

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        dismissNotification(notification.id)
      }, 5000)
      return () => clearTimeout(timer)
    })
  }, [notifications, dismissNotification])

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="text-white px-4 py-3 rounded-2xl shadow-2xl animate-slide-in flex items-center gap-3 cursor-pointer max-w-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid rgba(124,58,237,0.3)' }}
          onClick={() => dismissNotification(notification.id)}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-xl" style={{ background: 'var(--violet)' }}>
            🪙
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-white">{notification.message}</div>
            {notification.type === 'item-read' && notification.dailyProgress !== undefined && (
              <div className="text-xs text-[#5a5a72] mt-0.5">
                Daily: {notification.dailyProgress}/{notification.dailyMax} coins
              </div>
            )}
            {notification.multiplier && notification.multiplier > 1 && (
              <div className="text-xs text-[#a78bfa] mt-0.5">
                🔥 {notification.streak} day streak · {notification.multiplier}x
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
