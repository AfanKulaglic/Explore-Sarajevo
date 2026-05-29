'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi } from 'lucide-react'

// Session storage key to track if we've already shown loader this session
const LOADER_SHOWN_KEY = 'saraya_loader_shown'
const LOADER_VERSION = '1' // Increment this when you want to force show loader again

/**
 * PageLoader Component
 * 
 * A modern, animated loading screen that displays while the page content loads.
 * Features:
 * - Animated WiFi icon with pulse effect
 * - Progress bar animation
 * - Smooth fade-out transition when loading completes
 * - Session-aware: only shows once per browser session to avoid cache issues
 * - Multiple fallback mechanisms for reliability
 */
export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent double-initialization in React Strict Mode
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Check if we've already shown the loader this session
    // This prevents the loader from getting stuck when page is cached
    const loaderShown = sessionStorage.getItem(LOADER_SHOWN_KEY)
    if (loaderShown === LOADER_VERSION) {
      // Skip loader for subsequent navigations in same session
      setIsLoading(false)
      return
    }

    // Mark that we're showing the loader
    sessionStorage.setItem(LOADER_SHOWN_KEY, LOADER_VERSION)

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        // Faster at start, slower near end
        const increment = Math.max(1, 10 - Math.floor(prev / 10))
        return Math.min(prev + increment, 90)
      })
    }, 100)

    // Function to complete loading
    const completeLoading = () => {
      setProgress(100)
      setTimeout(() => setIsLoading(false), 400)
    }

    // Multiple detection methods for better reliability
    
    // Method 1: Document ready state
    if (document.readyState === 'complete') {
      completeLoading()
      return
    }

    // Method 2: Window load event
    const handleLoad = () => completeLoading()
    window.addEventListener('load', handleLoad)

    // Method 3: DOM content loaded (fires earlier than load)
    const handleDOMReady = () => {
      // Give a small buffer for React hydration
      setTimeout(() => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          completeLoading()
        }
      }, 100)
    }
    
    if (document.readyState === 'interactive') {
      handleDOMReady()
    } else {
      document.addEventListener('DOMContentLoaded', handleDOMReady)
    }

    // Method 4: requestIdleCallback for when browser is truly ready
    let idleCallbackId: number | undefined
    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(() => {
        completeLoading()
      }, { timeout: 2000 })
    }

    // Method 5: Fallback timeout - max 2.5 seconds (reduced from 3s)
    const fallbackTimeout = setTimeout(() => {
      completeLoading()
    }, 2500)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(fallbackTimeout)
      window.removeEventListener('load', handleLoad)
      document.removeEventListener('DOMContentLoaded', handleDOMReady)
      if (idleCallbackId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallbackId)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface-dark"
        >
          {/* Background gradient effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Main loader content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative mb-8"
            >
              {/* Outer ring */}
              <div className="absolute inset-0 w-20 h-20 rounded-2xl border-2 border-primary-500/30 animate-ping" style={{ animationDuration: '2s' }} />
              
              {/* Inner glow */}
              <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary-500/20 blur-xl" />
              
              {/* Logo container */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.5)',
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"
              >
                {/* WiFi icon with animation */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Wifi className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Brand name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-2xl font-bold text-white mb-2 tracking-tight"
            >
              Saraya Connect
            </motion.h1>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-sm text-white/50 mb-6"
            >
              Connecting...
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 200 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="relative h-1 bg-surface-border/50 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
              />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </motion.div>

            {/* Progress percentage */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-3 text-xs text-white/30 font-mono"
            >
              {progress}%
            </motion.span>
          </div>

          {/* Decorative dots */}
          <div className="absolute bottom-8 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
                className="w-2 h-2 rounded-full bg-primary-500"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Inline Loading Spinner
 * 
 * A smaller loading indicator for use within components.
 * Use this for section-level loading states.
 */
export function LoadingSpinner({ 
  size = 'md',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]}
          rounded-full
          border-primary-500/30
          border-t-primary-500
          animate-spin
        `}
      />
    </div>
  )
}

/**
 * Skeleton Loader
 * 
 * Placeholder loading state for content.
 */
export function Skeleton({ 
  className = '',
  variant = 'rectangular'
}: { 
  className?: string
  variant?: 'rectangular' | 'circular' | 'text'
}) {
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  }

  return (
    <div 
      className={`
        bg-surface-elevated/50
        animate-pulse
        ${variantClasses[variant]}
        ${className}
      `}
    />
  )
}
