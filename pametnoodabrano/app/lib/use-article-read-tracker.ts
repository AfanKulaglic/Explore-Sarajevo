'use client'

import { useEffect, useState, useRef } from 'react'
import { useRewardsSafe } from './reward-context'
import { useSarayaAccount } from './saraya-account'

const READ_TIME_THRESHOLD = 20 // seconds

interface UseArticleReadTrackerOptions {
  articleSlug: string
}

export function useArticleReadTracker({ articleSlug }: UseArticleReadTrackerOptions) {
  const { account } = useSarayaAccount()
  const rewards = useRewardsSafe()
  
  const [secondsRemaining, setSecondsRemaining] = useState(READ_TIME_THRESHOLD)
  const [canClaim, setCanClaim] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [claiming, setClaiming] = useState(false)
  
  const intervalIdRef = useRef<number | null>(null)

  // Check if already read today
  const alreadyRead = rewards?.hasReadArticle(articleSlug) || false

  // Simple countdown effect - runs once on mount
  useEffect(() => {
    // Don't start if no account or already read
    if (!account || alreadyRead) {
      return
    }

    // Clear any existing interval
    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current)
    }

    // Use window.setInterval for browser compatibility
    intervalIdRef.current = window.setInterval(() => {
      setSecondsRemaining(prev => {
        const newValue = prev - 1
        if (newValue <= 0) {
          // Stop the interval
          if (intervalIdRef.current) {
            window.clearInterval(intervalIdRef.current)
            intervalIdRef.current = null
          }
          setCanClaim(true)
          return 0
        }
        return newValue
      })
    }, 1000)

    // Cleanup on unmount
    return () => {
      if (intervalIdRef.current) {
        window.clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
  }, []) // Empty deps - only run on mount

  // Separate effect to handle account/alreadyRead changes
  useEffect(() => {
    if (!account || alreadyRead) {
      // Stop timer if logged out or already read
      if (intervalIdRef.current) {
        window.clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
  }, [account, alreadyRead])

  // Claim reward function
  const claimReward = async () => {
    if (!canClaim || claimed || claiming || !rewards) return false
    
    setClaiming(true)
    try {
      const result = await rewards.claimArticleRead(articleSlug)
      if (result.success) {
        setClaimed(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to claim reward:', error)
      return false
    } finally {
      setClaiming(false)
    }
  }

  return {
    secondsRemaining,
    canClaim,
    claimed: claimed || alreadyRead,
    claiming,
    claimReward,
    isLoggedIn: !!account,
    alreadyRead,
  }
}
