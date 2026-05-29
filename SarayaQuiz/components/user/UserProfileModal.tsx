'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Gem, Zap, Trophy, X, User, Mail, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { useSarayaAccount, refreshSarayaAccount } from '@/lib/saraya-account'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  name: string
}

export function UserProfileModal({ isOpen, onClose, email, name }: UserProfileModalProps) {
  const [refreshing, setRefreshing] = useState(false)
  // Use live account data from saraya-account hook (updates via realtime)
  const { account, tier } = useSarayaAccount()

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshSarayaAccount()
    setRefreshing(false)
  }

  // Calculate XP progress to next level (100 XP per level)
  const xpForCurrentLevel = account ? (account.level - 1) * 100 : 0
  const xpProgress = account ? account.xp - xpForCurrentLevel : 0
  const xpNeededForNextLevel = 100
  const progressPercent = account ? (xpProgress / xpNeededForNextLevel) * 100 : 0

  const displayName = account?.name || name
  const avatarUrl = account?.avatar_url

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          >
            <div className="bg-gradient-to-br from-purple-600/95 via-blue-600/95 to-blue-500/95 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl w-full max-w-md max-h-[calc(100vh-120px)] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My Profile</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 rounded-xl hover:bg-white/20 transition text-white/70 hover:text-white disabled:opacity-50"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/20 transition text-white/70 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        fill
                        sizes="64px"
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    {/* Tier indicator */}
                    <span
                      className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-purple-600 flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: tier.color, color: '#000' }}
                    >
                      {account?.level ?? 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-white/60" />
                      <span className="text-white font-semibold truncate">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-white/60" />
                      <span className="text-white/70 text-sm truncate">{email}</span>
                    </div>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: tier.color, color: '#000' }}
                    >
                      {tier.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Level & XP Progress */}
              {account && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-4 border border-green-400/30 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-green-300" />
                      <span className="text-white font-bold text-lg">Level {account.level}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/70 text-sm">
                      <Zap className="w-4 h-4 text-blue-300" />
                      <span>{account.xp} XP total</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-white/60">
                    <span>{xpProgress} XP</span>
                    <span>{Math.max(0, xpNeededForNextLevel - xpProgress)} XP to Level {account.level + 1}</span>
                  </div>
                </div>
              )}

              {/* Balance Cards */}
              {account && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Coins */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/10 rounded-2xl p-4 border border-white/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-6 h-6 text-yellow-300" />
                      <span className="text-white/70 text-sm">Coins</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{account.coins.toLocaleString()}</div>
                  </motion.div>

                  {/* Tokens */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-400/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Gem className="w-6 h-6 text-pink-300" />
                      <span className="text-white/70 text-sm">Tokens</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{account.tokens.toLocaleString()}</div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
