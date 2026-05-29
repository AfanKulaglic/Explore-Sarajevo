'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Star, Trophy, Coins } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward?: number
  coinReward?: number
}

interface AchievementCelebrationProps {
  achievement: Achievement | null
  onClose: () => void
}

export function AchievementCelebration({ achievement, onClose }: AchievementCelebrationProps) {
  // Trigger confetti when achievement is shown
  useEffect(() => {
    if (achievement) {
      // Fire confetti - reduced for mobile performance
      const duration = 2500
      const animationEnd = Date.now() + duration
      const isMobile = window.innerWidth < 640
      const defaults = { 
        startVelocity: isMobile ? 20 : 30, 
        spread: 360, 
        ticks: isMobile ? 40 : 60, 
        zIndex: 9999,
        disableForReducedMotion: true,
      }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = (isMobile ? 25 : 50) * (timeLeft / duration)
        
        // Since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#34d399'],
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#34d399'],
        })
      }, isMobile ? 350 : 250)

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'

      return () => {
        clearInterval(interval)
        document.body.style.overflow = ''
      }
    }
  }, [achievement])

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto safe-area-inset-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile swipe indicator */}
            <div className="sm:hidden flex justify-center mb-3">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white active:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Celebration header */}
            <div className="text-center mb-4 sm:mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-amber-500/20 px-3 sm:px-4 py-1.5 sm:py-2 text-amber-400"
              >
                <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-bold uppercase tracking-wider text-xs sm:text-sm">Achievement Unlocked!</span>
                <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" />
              </motion.div>
            </div>

            {/* Achievement icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', damping: 15 }}
              className="flex justify-center mb-4 sm:mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20" />
                <div className="relative flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/30">
                  <span className="text-4xl sm:text-5xl">{achievement.icon}</span>
                </div>
                {/* Sparkles around icon - hidden on small mobile */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 hidden xs:block"
                >
                  <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400" size={18} />
                  <Star className="absolute top-1/2 -right-2 -translate-y-1/2 text-yellow-400 fill-yellow-400" size={14} />
                  <Sparkles className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-amber-400" size={18} />
                  <Star className="absolute top-1/2 -left-2 -translate-y-1/2 text-yellow-400 fill-yellow-400" size={14} />
                </motion.div>
              </div>
            </motion.div>

            {/* Achievement info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-4 sm:mb-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{achievement.title}</h2>
              <p className="text-white/60 text-sm sm:text-base">{achievement.description}</p>
            </motion.div>

            {/* Rewards */}
            {(achievement.xpReward || achievement.coinReward) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6"
              >
                {achievement.xpReward && achievement.xpReward > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-emerald-500/20 px-3 sm:px-4 py-2 sm:py-3 border border-emerald-500/30">
                    <Star className="text-emerald-400 fill-emerald-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-emerald-400 font-bold text-sm sm:text-lg">+{achievement.xpReward.toLocaleString()} XP</span>
                  </div>
                )}
                {achievement.coinReward && achievement.coinReward > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-amber-500/20 px-3 sm:px-4 py-2 sm:py-3 border border-amber-500/30">
                    <Coins className="text-amber-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-amber-400 font-bold text-sm sm:text-lg">+{achievement.coinReward.toLocaleString()}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 sm:py-3.5 font-semibold text-black hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 transition-colors text-sm sm:text-base"
            >
              Awesome! 🎉
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
