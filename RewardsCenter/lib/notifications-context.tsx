'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth-context'

export interface Notification {
  id: string
  account_id: string
  type: 'ACHIEVEMENT' | 'LEVEL_UP' | 'REWARD' | 'COINS' | 'PROMO' | 'SYSTEM'
  title: string
  body: string | null
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationIds: string[]) => Promise<void>
  markAllAsRead: () => Promise<void>
  pendingNotification: Notification | null
  setPendingNotification: (notification: Notification | null) => void
  clearPendingNotification: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingNotification, setPendingNotification] = useState<Notification | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications?account_id=${user.id}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!user?.id || notificationIds.length === 0) return

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: user.id,
          notification_ids: notificationIds
        })
      })

      // Update local state
      setNotifications(prev => prev.map(n => 
        notificationIds.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }, [user?.id])

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: user.id,
          mark_all: true
        })
      })

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }, [user?.id])

  const clearPendingNotification = useCallback(() => {
    setPendingNotification(null)
  }, [])

  // Check achievements (this creates notifications for newly unlocked ones)
  const checkAchievements = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const achievementsUrl = new URL('/api/achievements/user', window.location.origin)
      achievementsUrl.searchParams.set('account_id', user.id)
      achievementsUrl.searchParams.set('level', String(user.level || 1))
      achievementsUrl.searchParams.set('xp', String(user.xp || 0))
      achievementsUrl.searchParams.set('coins', String(user.coins || 0))
      
      await fetch(achievementsUrl.toString())
      // After checking achievements, refresh notifications
      await fetchNotifications()
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }, [user?.id, user?.level, user?.xp, user?.coins, fetchNotifications])

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications()
      // Also check achievements to create any pending notifications
      checkAchievements()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isAuthenticated, user?.id, fetchNotifications, checkAchievements])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id, fetchNotifications])

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      pendingNotification,
      setPendingNotification,
      clearPendingNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
