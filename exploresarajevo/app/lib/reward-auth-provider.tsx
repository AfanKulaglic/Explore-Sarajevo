'use client'

import { ReactNode, useEffect, useState } from 'react'
import { RewardProvider, RewardNotifications } from './reward-context'
import { useAuth } from './auth-context'

interface RewardAuthProviderProps {
  children: ReactNode
}

export function RewardAuthProvider({ children }: RewardAuthProviderProps) {
  const { user, loading } = useAuth()
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    // Only try to get token if user is logged in
    if (!user || loading) {
      setAuthToken(null)
      return
    }

    // Dynamically import to avoid SSR issues and get fresh token
    const getToken = async () => {
      try {
        const { createAuthSupabaseClient } = await import('./supabase-auth')
        const supabase = createAuthSupabaseClient()
        
        // Get session without triggering refresh - just read what's stored
        const { data: { session }, error } = await supabase.auth.getSession()
        let token = session?.access_token ?? null

        if (!token) {
          const { data: refreshed } = await supabase.auth.refreshSession()
          token = refreshed.session?.access_token ?? null
        }

        if (error && !token) {
          setAuthToken(null)
        } else if (token) {
          setAuthToken(token)
        } else {
          setAuthToken(null)
        }
      } catch (error) {
        console.error('Failed to get auth token for rewards:', error)
        setAuthToken(null)
      }
    }

    getToken()
  }, [user, loading])

  return (
    <RewardProvider authToken={authToken}>
      {children}
      <RewardNotifications />
    </RewardProvider>
  )
}
