'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Coins, X, CheckCircle } from 'lucide-react'
import { useRewards } from '@/app/lib/reward-context'

export function RewardNotifications() {
  const { notifications, dismissNotification } = useRewards()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`
              relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl
              ${notification.type === 'daily' 
                ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-400/50' 
                : 'bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 border-violet-400/50'
              }
            `}
          >
            <div className="flex items-center gap-3 p-4">
              {/* Icon */}
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-xl
                ${notification.type === 'daily' ? 'bg-amber-400/30' : 'bg-violet-400/30'}
              `}>
                {notification.type === 'daily' ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <Coins className="w-5 h-5 text-yellow-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm leading-snug">
                  {notification.message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => dismissNotification(notification.id)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className={`
                absolute bottom-0 left-0 h-1
                ${notification.type === 'daily' ? 'bg-amber-300/50' : 'bg-violet-300/50'}
              `}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
