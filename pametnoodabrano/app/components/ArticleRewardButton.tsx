'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins, Check, Loader2 } from 'lucide-react'
import { useRewardsSafe } from '../lib/reward-context'
import { useSarayaAccount } from '../lib/saraya-account'

const READ_TIME_THRESHOLD = 20 // seconds

interface ArticleRewardButtonProps {
  articleSlug: string
  language: string
}

export default function ArticleRewardButton({ articleSlug, language }: ArticleRewardButtonProps) {
  const { account } = useSarayaAccount()
  const rewards = useRewardsSafe()
  
  const [seconds, setSeconds] = useState(READ_TIME_THRESHOLD)
  const [claimed, setClaimed] = useState(false)
  const [claiming, setClaiming] = useState(false)

  // Check if already read today
  const alreadyRead = rewards?.hasReadArticle(articleSlug) ?? false
  const canClaim = seconds === 0

  // Simple countdown - runs on mount, no dependencies
  useEffect(() => {
    // Don't run if already read
    if (alreadyRead) return

    const intervalId = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalId)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [alreadyRead])

  // Claim reward
  const handleClaim = async () => {
    if (!canClaim || claimed || claiming || !rewards || !account) return
    
    setClaiming(true)
    try {
      const result = await rewards.claimArticleRead(articleSlug)
      if (result.success) {
        setClaimed(true)
      }
    } catch (error) {
      console.error('Failed to claim:', error)
    } finally {
      setClaiming(false)
    }
  }

  // Not logged in - show login prompt
  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 pt-8 border-t border-gray-200"
      >
        <div className="w-full py-4 px-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-200 flex items-center justify-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg">
            <Coins className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="text-left">
            <p className="text-violet-800 font-semibold">
              {language === 'en' ? 'Earn coins for reading!' : 'Zarađuj novčiće čitanjem!'}
            </p>
            <p className="text-violet-600 text-sm">
              {language === 'en' ? 'Sign in to earn +50 coins per article' : 'Prijavi se i zarađuj +50 novčića po članku'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Already claimed (from today's session or previous)
  if (claimed || alreadyRead) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 pt-8 border-t border-gray-200"
      >
        <div className="flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-emerald-800 font-semibold">
              {language === 'en' ? 'Reward Claimed!' : 'Nagrada preuzeta!'}
            </p>
            <p className="text-emerald-600 text-sm">
              {language === 'en' ? '+50 coins earned for this article' : '+50 novčića zarađeno za ovaj članak'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Ready to claim
  if (canClaim) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 pt-8 border-t border-gray-200"
      >
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 rounded-2xl shadow-xl shadow-violet-500/30 flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {claiming ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20">
              <Coins className="w-6 h-6 text-yellow-300" />
            </div>
          )}
          <div className="text-left">
            <p className="text-white font-bold text-lg">
              {claiming 
                ? (language === 'en' ? 'Claiming...' : 'Preuzimanje...')
                : (language === 'en' ? 'Claim Reward!' : 'Preuzmi nagradu!')
              }
            </p>
            <p className="text-white/80 text-sm">
              {language === 'en' ? '+50 coins for reading this article' : '+50 novčića za čitanje ovog članka'}
            </p>
          </div>
        </button>
      </motion.div>
    )
  }

  // Countdown state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 pt-8 border-t border-gray-200"
    >
      <div className="w-full py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg">
          <span className="text-2xl font-bold text-white">{seconds}</span>
        </div>
        <div className="text-left">
          <p className="text-gray-800 font-semibold">
            {language === 'en' ? 'Keep reading...' : 'Nastavi čitati...'}
          </p>
          <p className="text-gray-600 text-sm">
            {language === 'en' 
              ? `${seconds} seconds until you can claim +50 coins` 
              : `Još ${seconds} sekundi do +50 novčića`
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}
