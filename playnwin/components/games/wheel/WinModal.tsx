'use client';

import { WinModalProps } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import iconMap from '@/components/shared/IconMap';
import { Coins, Sparkles, Clock } from 'lucide-react';

export default function WinModal({ isOpen, prize, onClose, canEarnRewards = true, isAuthenticated = false, timeUntilReset }: WinModalProps) {
  if (!prize) return null;

  const IconComponent = iconMap[prize.icon];
  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center pt-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div 
          className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${prize.color}, ${prize.color}99)` }}
        >
          {IconComponent && <IconComponent className="w-12 h-12 text-white" strokeWidth={2} />}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
        <p className="text-xl text-pink-400 font-semibold mb-2">{prize.label}</p>
        <p className="text-white/60 text-sm mb-4">{prize.description}</p>
        
        {/* Rewards display */}
        {canEarnRewards ? (
          <div className="flex items-center justify-center gap-4 mb-6">
            {prize.coins_reward > 0 && (
              <div className="flex items-center gap-2 bg-yellow-500/20 rounded-full px-4 py-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">+{prize.coins_reward}</span>
              </div>
            )}
            {prize.xp_reward > 0 && (
              <div className="flex items-center gap-2 bg-cyan-500/20 rounded-full px-4 py-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-bold">+{prize.xp_reward} XP</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
            {isAuthenticated && timeUntilReset ? (
              <p className="text-white/60 text-sm flex items-center justify-center gap-2">
                <Clock size={16} />
                Rewards available in {formatTime(timeUntilReset.hours)}:{formatTime(timeUntilReset.minutes)}:{formatTime(timeUntilReset.seconds)}
              </p>
            ) : (
              <p className="text-white/60 text-sm">Sign in to earn rewards!</p>
            )}
          </div>
        )}
        
        <button 
          onClick={onClose}
          className="w-full py-3 rounded-full font-semibold spin-button-gradient text-white"
        >
          Awesome!
        </button>
      </div>
    </Modal>
  );
}
