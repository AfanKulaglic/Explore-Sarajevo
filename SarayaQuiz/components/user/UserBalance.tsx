'use client'

import { useEffect, useState } from 'react'
import { getUserBalanceAction } from '@/app/actions/user-actions'
import { motion } from 'framer-motion'
import { Coins, Gem, Zap, Trophy } from 'lucide-react'

interface UserBalanceProps {
  email: string
  name: string
}

export function UserBalance({ email, name }: UserBalanceProps) {
  const [balance, setBalance] = useState<{
    coins: number
    tokens: number
    xp: number
    level: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const data = await getUserBalanceAction(email)
        if (data) {
          setBalance(data)
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [email])

  if (loading) {
    return (
      <div className="flex gap-3 items-center">
        <div className="animate-pulse bg-white/20 rounded-2xl px-4 py-2 h-10 w-20"></div>
        <div className="animate-pulse bg-white/20 rounded-2xl px-4 py-2 h-10 w-20"></div>
      </div>
    )
  }

  if (!balance) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/30"
      >
        <Coins className="w-5 h-5 text-yellow-300" />
        <span className="text-white font-semibold">{balance.coins}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-purple-400/50"
      >
        <Gem className="w-5 h-5 text-pink-300" />
        <span className="text-white font-semibold">{balance.tokens}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/30"
      >
        <Zap className="w-5 h-5 text-blue-300" />
        <span className="text-white font-semibold">{balance.xp} XP</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-green-400/50"
      >
        <Trophy className="w-5 h-5 text-green-300" />
        <span className="text-white font-semibold">Level {balance.level}</span>
      </motion.div>
    </div>
  )
}
