'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal, Loader2, Crown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LeaderboardEntry {
  id: string;
  rank: number;
  accountId: string;
  name: string;
  avatarUrl: string | null;
  score: number;
  joinedAt: string;
  eliminated: boolean;
}

interface TournamentLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentTitle: string;
  currentUserId?: string;
}

export function TournamentLeaderboardModal({
  isOpen,
  onClose,
  tournamentId,
  tournamentTitle,
  currentUserId,
}: TournamentLeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && tournamentId) {
      fetchLeaderboard();
    }
  }, [isOpen, tournamentId]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/leaderboard?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={20} className="text-amber-400" />;
      case 2:
        return <Medal size={20} className="text-slate-300" />;
      case 3:
        return <Medal size={20} className="text-orange-400" />;
      default:
        return <span className="text-sm font-bold text-white/50">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/30';
      case 2:
        return 'bg-gradient-to-r from-slate-400/20 to-slate-500/10 border-slate-400/30';
      case 3:
        return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  if (!isOpen) return null;

  // Use portal to render modal at document body level
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl max-h-[85vh] sm:max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <Trophy size={20} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Leaderboard</h2>
                  <p className="text-xs text-white/50 line-clamp-1">{tournamentTitle}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose(); }}
                className="z-10 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-brand-500" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users size={48} className="text-white/20 mb-4" />
                  <p className="text-white/60">No participants yet</p>
                  <p className="text-sm text-white/40">Be the first to join!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 transition',
                        getRankStyle(entry.rank),
                        entry.accountId === currentUserId && 'ring-2 ring-brand-500/50'
                      )}
                    >
                      {/* Rank */}
                      <div className="flex h-8 w-8 items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/10">
                        {entry.avatarUrl ? (
                          <Image
                            src={entry.avatarUrl}
                            alt={entry.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-semibold truncate',
                          entry.accountId === currentUserId ? 'text-brand-400' : 'text-white'
                        )}>
                          {entry.name}
                          {entry.accountId === currentUserId && (
                            <span className="ml-2 text-xs text-brand-400">(You)</span>
                          )}
                        </p>
                        {entry.eliminated && (
                          <p className="text-xs text-rose-400">Eliminated</p>
                        )}
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className={cn(
                          'text-lg font-bold',
                          entry.rank === 1 && 'text-amber-400',
                          entry.rank === 2 && 'text-slate-300',
                          entry.rank === 3 && 'text-orange-400',
                          entry.rank > 3 && 'text-white'
                        )}>
                          {entry.score.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-white/40 uppercase">points</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {total > 0 && (
              <div className="border-t border-white/10 p-4 text-center">
                <p className="text-sm text-white/50">
                  {total} participant{total !== 1 ? 's' : ''} total
                </p>
              </div>
            )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
