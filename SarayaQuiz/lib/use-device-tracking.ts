'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const DEVICE_ID_KEY = 'saraya_device_id'
const SESSION_ID_KEY = 'saraya_session_id'

// Generate UUID without external dependency
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface DeviceInfo {
  deviceId: string
  session_id: string
  platform: string
  user_agent: string
  referrer: string
}

interface TrackEventOptions {
  event_type: string
  event_data?: Record<string, any>
  quizId?: string
  attempt_id?: string
  question_id?: string
}

/**
 * Hook for managing device ID and tracking analytics
 */
export function useDeviceTracking() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isReady, setIsReady] = useState(false)
  const account_idRef = useRef<string | null>(null)

  // Initialize device ID and session
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get or create device ID
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)
    if (!deviceId) {
      deviceId = generateUUID()
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }

    // Get or create session ID (lives in sessionStorage)
    let session_id = sessionStorage.getItem(SESSION_ID_KEY)
    if (!session_id) {
      session_id = generateUUID()
      sessionStorage.setItem(SESSION_ID_KEY, session_id)
    }

    const info: DeviceInfo = {
      deviceId: deviceId,
      session_id: session_id,
      platform: detectPlatform(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || '',
    }

    setDeviceInfo(info)
    setIsReady(true)

    // Track page view
    trackEventInternal('page_view', { path: window.location.pathname }, info)
  }, [])

  /**
   * Set the current account ID for tracking
   */
  const setAccountId = useCallback((account_id: string | null) => {
    account_idRef.current = account_id
  }, [])

  /**
   * Track an analytics event
   */
  const trackEvent = useCallback(async (options: TrackEventOptions) => {
    if (!deviceInfo) return

    await trackEventInternal(
      options.event_type,
      {
        ...options.event_data,
        quiz_post_id: options.quizId,
        attempt_id: options.attempt_id,
        question_id: options.question_id,
      },
      deviceInfo,
      account_idRef.current
    )
  }, [deviceInfo])

  /**
   * Check rewards for a quiz
   */
  const checkRewards = useCallback(async (quizId: string, account_id?: string) => {
    if (!deviceInfo) return null

    try {
      const params = new URLSearchParams({
        deviceId: deviceInfo.deviceId,
        ...(account_id && { account_id }),
      })

      const response = await fetch(`/api/quiz/${quizId}/rewards/check?${params}`)
      if (!response.ok) return null

      return await response.json()
    } catch (error) {
      console.error('Failed to check rewards:', error)
      return null
    }
  }, [deviceInfo])

  /**
   * Claim rewards after quiz completion
   */
  const claimRewards = useCallback(async (params: {
    quizId: string
    attempt_id: string
    account_id?: string
    score: number
    max_score: number
    time_spent_seconds?: number
  }) => {
    if (!deviceInfo) return null

    try {
      const response = await fetch(`/api/quiz/${params.quizId}/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: params.attempt_id,
          rawDeviceId: deviceInfo.deviceId,
          account_id: params.account_id,
          score: params.score,
          max_score: params.max_score,
          time_spent_seconds: params.time_spent_seconds,
          session_id: deviceInfo.session_id,
          platform: deviceInfo.platform,
          referrer: deviceInfo.referrer,
          user_agent: deviceInfo.user_agent,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to claim rewards')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to claim rewards:', error)
      throw error
    }
  }, [deviceInfo])

  return {
    deviceId: deviceInfo?.deviceId ?? null,
    session_id: deviceInfo?.session_id ?? null,
    platform: deviceInfo?.platform ?? null,
    isReady,
    setAccountId,
    trackEvent,
    checkRewards,
    claimRewards,
  }
}

/**
 * Internal track event function
 */
async function trackEventInternal(
  event_type: string,
  event_data: Record<string, any>,
  deviceInfo: DeviceInfo,
  account_id?: string | null
): Promise<void> {
  try {
    // Use sendBeacon for better reliability on page unload
    if (navigator.sendBeacon && ['page_unload', 'quiz_abandon'].includes(event_type)) {
      const params = new URLSearchParams({
        event_type,
        deviceId: deviceInfo.deviceId,
        session_id: deviceInfo.session_id,
        ...(account_id && { account_id }),
        ...Object.fromEntries(
          Object.entries(event_data).map(([k, v]) => [k, String(v)])
        ),
      })
      navigator.sendBeacon(`/api/quiz/analytics/track?${params}`)
      return
    }

    // Regular fetch for other events
    await fetch('/api/quiz/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type,
        event_data,
        rawDeviceId: deviceInfo.deviceId,
        session_id: deviceInfo.session_id,
        platform: deviceInfo.platform,
        referrer: deviceInfo.referrer,
        user_agent: deviceInfo.user_agent,
        account_id,
      }),
    })
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.debug('Failed to track event:', error)
  }
}

/**
 * Detect platform type
 */
function detectPlatform(): string {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent.toLowerCase()
  
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    if (/ipad|tablet/i.test(ua) || (window.innerWidth >= 768 && window.innerHeight >= 1024)) {
      return 'tablet'
    }
    return 'mobile'
  }
  
  return 'web'
}

// Note: DeviceTrackingProvider removed - use the hook directly in components
