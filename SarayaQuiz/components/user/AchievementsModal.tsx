'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Lock, CheckCircle, Loader2 } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
  account_id?: string
  level?: number
  xp?: number
  coins?: number
}

const REWARDS_CENTER_API = 'https://rewards.saraya.solutions'

export function AchievementsModal({ isOpen, onClose, account_id, level = 1, xp = 0, coins = 0 }: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && account_id) {
      fetchAchievements()
    } else if (isOpen && !account_id) {
      setLoading(false)
      setError('Please sign in to view your achievements')
    }
  }, [isOpen, account_id])

  async function fetchAchievements() {
    setLoading(true)
    setError(null)
    
    try {
      // Build URL with user stats for progress calculation
      const url = new URL(`${REWARDS_CENTER_API}/api/achievements/user`)
      url.searchParams.set('account_id', account_id!)
      url.searchParams.set('level', String(level))
      url.searchParams.set('xp', String(xp))
      url.searchParams.set('coins', String(coins))
      url.searchParams.set('tier', getTierFromLevel(level))
      
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements')
      }
      
      const data = await response.json()
      
      // Transform API response to our Achievement interface
      const achievementsData = data.data || data.achievements || []
      const mappedAchievements: Achievement[] = achievementsData.map((a: any) => ({
        id: a.id,
        title: a.name || a.title,
        description: a.description || '',
        icon: a.icon || '🏆',
        unlockedAt: a.unlocked_at || a.unlockedAt,
        progress: a.progress,
        maxProgress: a.max_progress || a.maxProgress,
      }))
      
      // Sort: unlocked first, then by progress
      mappedAchievements.sort((a, b) => {
        if (a.unlockedAt && !b.unlockedAt) return -1
        if (!a.unlockedAt && b.unlockedAt) return 1
        return 0
      })
      
      setAchievements(mappedAchievements)
    } catch (err) {
      console.error('Error fetching achievements:', err)
      setError('Could not load achievements. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  function getTierFromLevel(level: number): string {
    if (level >= 35) return 'DIAMOND'
    if (level >= 20) return 'PLATINUM'
    if (level >= 10) return 'GOLD'
    if (level >= 5) return 'SILVER'
    return 'BRONZE'
  }

  const unlockedCount = achievements.filter(a => a.unlockedAt).length

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
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          >
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Achievements</h2>
                    {achievements.length > 0 && (
                      <p className="text-sm text-white/50">
                        {unlockedCount}/{achievements.length} Unlocked
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/10 transition text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto pr-1 -mr-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                    <p className="text-white/50">Loading achievements...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Trophy className="w-12 h-12 text-white/20 mb-3" />
                    <p className="text-white/50">{error}</p>
                    {!account_id && (
                      <a
                        href="/auth/user-login"
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition"
                      >
                        Sign In
                      </a>
                    )}
                  </div>
                ) : achievements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Trophy className="w-12 h-12 text-white/20 mb-3" />
                    <p className="text-white/50">No achievements yet</p>
                    <p className="text-white/30 text-sm mt-1">Complete activities to unlock achievements</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => {
                      const isUnlocked = !!achievement.unlockedAt
                      const hasProgress = !isUnlocked && achievement.progress !== undefined
                      const progressPercent = hasProgress && achievement.maxProgress
                        ? Math.min(100, (achievement.progress! / achievement.maxProgress) * 100)
                        : 0

                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                            isUnlocked
                              ? 'border-emerald-500/30 bg-emerald-500/10'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          {/* Icon */}
                          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                            isUnlocked ? 'bg-emerald-500/20' : 'bg-white/10'
                          }`}>
                            {achievement.icon}
                          </span>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold truncate ${
                                isUnlocked ? 'text-white' : 'text-white/60'
                              }`}>
                                {achievement.title}
                              </p>
                              {isUnlocked && (
                                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-white/50 truncate">{achievement.description}</p>
                            
                            {/* Progress bar */}
                            {hasProgress && achievement.maxProgress && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                                  <span>{achievement.progress?.toLocaleString()} / {achievement.maxProgress.toLocaleString()}</span>
                                  <span>{Math.round(progressPercent)}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Lock icon for locked achievements without progress */}
                          {!isUnlocked && !hasProgress && (
                            <Lock size={16} className="shrink-0 text-white/30" />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <a
                  href="https://rewards.saraya.solutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-400 hover:text-amber-300 transition"
                >
                  View all in Rewards Center →
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
