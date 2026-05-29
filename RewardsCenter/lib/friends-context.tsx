'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth-context'

interface FriendsContextType {
  friendRequestCount: number
  refreshFriendRequestCount: () => Promise<void>
  decrementFriendRequestCount: () => void
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined)

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [friendRequestCount, setFriendRequestCount] = useState(0)

  const refreshFriendRequestCount = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      setFriendRequestCount(0)
      return
    }

    try {
      const response = await fetch(`/api/friends/requests?user_id=${user.id}&type=received`)
      if (response.ok) {
        const data = await response.json()
        const count = Array.isArray(data.data) ? data.data.length : 0
        setFriendRequestCount(count)
      } else {
        setFriendRequestCount(0)
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error)
      setFriendRequestCount(0)
    }
  }, [user?.id, isAuthenticated])

  // Decrement the count immediately (optimistic update)
  const decrementFriendRequestCount = useCallback(() => {
    setFriendRequestCount(prev => Math.max(0, prev - 1))
  }, [])

  // Fetch on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshFriendRequestCount()
    } else {
      setFriendRequestCount(0)
    }
  }, [isAuthenticated, user?.id, refreshFriendRequestCount])

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const interval = setInterval(refreshFriendRequestCount, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id, refreshFriendRequestCount])

  return (
    <FriendsContext.Provider value={{
      friendRequestCount,
      refreshFriendRequestCount,
      decrementFriendRequestCount
    }}>
      {children}
    </FriendsContext.Provider>
  )
}

export function useFriends() {
  const context = useContext(FriendsContext)
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider')
  }
  return context
}
