'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Gift, Coins, X, Sparkles, Bell } from 'lucide-react';
import { useNotifications } from '@/lib/notifications-context';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useTranslation } from '@/lib/i18n';

function getNotificationIcon(type: string, size: number = 32) {
  switch (type) {
    case 'ACHIEVEMENT':
      return <Trophy size={size} className="text-amber-400" />;
    case 'LEVEL_UP':
      return <Star size={size} className="text-violet-400" />;
    case 'REWARD':
      return <Gift size={size} className="text-brand-400" />;
    case 'COINS':
      return <Coins size={size} className="text-emerald-400" />;
    case 'PROMO':
      return <Sparkles size={size} className="text-rose-400" />;
    default:
      return <Bell size={size} className="text-white/60" />;
  }
}

function getNotificationGradient(type: string) {
  switch (type) {
    case 'ACHIEVEMENT':
      return 'from-amber-500/20 to-orange-500/20';
    case 'LEVEL_UP':
      return 'from-violet-500/20 to-purple-500/20';
    case 'REWARD':
      return 'from-brand-500/20 to-blue-500/20';
    case 'COINS':
      return 'from-emerald-500/20 to-green-500/20';
    case 'PROMO':
      return 'from-rose-500/20 to-pink-500/20';
    default:
      return 'from-slate-500/20 to-slate-600/20';
  }
}

function getNotificationBorderColor(type: string) {
  switch (type) {
    case 'ACHIEVEMENT':
      return 'border-amber-500/30';
    case 'LEVEL_UP':
      return 'border-violet-500/30';
    case 'REWARD':
      return 'border-brand-500/30';
    case 'COINS':
      return 'border-emerald-500/30';
    case 'PROMO':
      return 'border-rose-500/30';
    default:
      return 'border-white/10';
  }
}

// Get confetti colors based on notification type
function getConfettiColors(type: string): string[] {
  switch (type) {
    case 'ACHIEVEMENT':
      return ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#34d399'];
    case 'LEVEL_UP':
      return ['#8b5cf6', '#a78bfa', '#c4b5fd', '#fbbf24', '#f59e0b'];
    case 'REWARD':
      return ['#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#34d399'];
    case 'COINS':
      return ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#fcd34d'];
    default:
      return ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#34d399'];
  }
}

export function NotificationPopup() {
  const { pendingNotification, clearPendingNotification, markAsRead } = useNotifications();
  const { t } = useTranslation();

  // Trigger confetti when popup shows
  useEffect(() => {
    if (pendingNotification) {
      // Simple confetti burst
      const colors = getConfettiColors(pendingNotification.type);
      
      // Left side
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.1, y: 0.5 },
        colors,
        zIndex: 9999,
      });
      
      // Right side
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.9, y: 0.5 },
        colors,
        zIndex: 9999,
      });
      
      // Center burst
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        colors,
        zIndex: 9999,
      });

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [pendingNotification]);

  // Mark as read separately
  useEffect(() => {
    if (pendingNotification && !pendingNotification.read_at) {
      markAsRead([pendingNotification.id]);
    }
  }, [pendingNotification, markAsRead]);

  const handleClose = () => {
    clearPendingNotification();
  };

  return (
    <AnimatePresence>
      {pendingNotification && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[100] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className={`relative overflow-hidden rounded-3xl border ${getNotificationBorderColor(pendingNotification.type)} bg-slate-900/95 backdrop-blur-xl shadow-2xl`}>
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getNotificationGradient(pendingNotification.type)} opacity-50`} />
              
              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>

              {/* Content */}
              <div className="relative p-6 text-center">
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  {getNotificationIcon(pendingNotification.type, 40)}
                </div>

                {/* Title */}
                <h2 className="mb-2 text-2xl font-bold text-white">
                  {pendingNotification.title}
                </h2>

                {/* Body */}
                <p className="mb-6 text-white/70">
                  {pendingNotification.body}
                </p>

                {/* Rewards display for achievements */}
                {pendingNotification.type === 'ACHIEVEMENT' && pendingNotification.data && (
                  <div className="mb-6 flex items-center justify-center gap-4">
                    {(pendingNotification.data as any).coins_reward > 0 && (
                      <div className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2">
                        <Coins size={18} className="text-amber-400" />
                        <span className="font-semibold text-amber-400">
                          +{((pendingNotification.data as any).coins_reward || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {(pendingNotification.data as any).xp_reward > 0 && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2">
                        <Star size={18} className="text-emerald-400" />
                        <span className="font-semibold text-emerald-400">
                          +{((pendingNotification.data as any).xp_reward || 0).toLocaleString()} XP
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Level display for level ups */}
                {pendingNotification.type === 'LEVEL_UP' && pendingNotification.data && (
                  <div className="mb-6 flex items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl bg-violet-500/20 px-6 py-3">
                      <span className="text-3xl font-bold text-violet-400">
                        {t.common.level} {(pendingNotification.data as any).level}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action button */}
                <button
                  onClick={handleClose}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 font-semibold text-white transition hover:from-brand-500 hover:to-brand-400"
                >
                  {t.common.awesome}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
