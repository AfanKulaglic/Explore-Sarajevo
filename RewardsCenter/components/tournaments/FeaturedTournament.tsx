'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy, Clock, Users, Zap, ChevronRight, Loader2, Check, LogOut } from "lucide-react";
import { Tournament } from "@/lib/types";
import { cn } from "@/lib/utils";
import { joinTournament, leaveTournament } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import confetti from "canvas-confetti";
import { TournamentLeaderboardModal } from "./TournamentLeaderboardModal";
import { TournamentDetailsModal } from "./TournamentDetailsModal";

interface FeaturedTournamentProps {
  tournament: Tournament;
  isJoined?: boolean;
  onJoinChange?: () => void;
}

const formatTimeRemaining = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) return { days: 0, hours: 0, mins: 0 };
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, mins };
};

export function FeaturedTournament({ tournament, isJoined = false, onJoinChange }: FeaturedTournamentProps) {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [joined, setJoined] = useState(isJoined);
  const [error, setError] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => formatTimeRemaining(tournament.endDate));

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeRemaining(tournament.endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament.endDate]);

  const handleJoin = async () => {
    if (!user) {
      setError('Please log in to join');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await joinTournament(tournament.id, user.id, user.email);
    
    if (result.success) {
      setJoined(true);
      onJoinChange?.();
      await refreshUser();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    } else {
      setError(result.error || 'Failed to join');
    }

    setIsLoading(false);
  };

  const handleLeave = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    const result = await leaveTournament(tournament.id, user.id);
    
    if (result.success) {
      setJoined(false);
      onJoinChange?.();
      await refreshUser();
    } else {
      setError(result.error || 'Failed to leave');
    }

    setIsLoading(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setShowDetails(true)}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-900/80 backdrop-blur-2xl cursor-pointer"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={tournament.imageUrl}
          alt={tournament.title}
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      </div>
      
      <div className="relative grid gap-4 sm:gap-6 p-4 sm:p-8 lg:grid-cols-[1fr_auto]">
        {/* Left Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status & Type */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-emerald-400">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500" />
              </span>
              LIVE
            </span>
            <span className="rounded-full bg-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white/80">
              🏆 <span className="hidden sm:inline">{tournament.type} </span>Tournament
            </span>
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-lg">
              <Zap size={12} className="inline mr-0.5 sm:mr-1 sm:hidden" />
              <Zap size={14} className="hidden sm:inline mr-1" />
              FEATURED
            </span>
          </div>
          
          {/* Title & Description */}
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-white lg:text-4xl">
              {tournament.title}
            </h2>
            <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base text-white/60 line-clamp-2 sm:line-clamp-none">
              {tournament.description}
            </p>
          </div>
          
          {/* Prize Breakdown */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {tournament.prizes.slice(0, 3).map((prize, index) => (
              <div 
                key={prize.place}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border px-2.5 sm:px-4 py-2 sm:py-3",
                  index === 0 && "border-amber-500/30 bg-amber-500/10",
                  index === 1 && "border-slate-400/30 bg-slate-400/10",
                  index === 2 && "border-orange-600/30 bg-orange-600/10"
                )}
              >
                <span className="text-lg sm:text-2xl">{prize.badge}</span>
                <div>
                  <p className="text-[10px] sm:text-xs text-white/50">{prize.place === 1 ? "1st" : prize.place === 2 ? "2nd" : "3rd"}</p>
                  <p className={cn(
                    "text-sm sm:text-lg font-bold",
                    index === 0 && "text-amber-400",
                    index === 1 && "text-slate-300",
                    index === 2 && "text-orange-400"
                  )}>
                    {prize.coins.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-white/60">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Users size={14} className="sm:hidden" />
              <Users size={16} className="hidden sm:block" />
              <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Trophy size={14} className="sm:hidden" />
              <Trophy size={16} className="hidden sm:block" />
              <span>{tournament.prizes.reduce((sum, p) => sum + p.coins, 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap size={14} className="sm:hidden" />
              <Zap size={16} className="hidden sm:block" />
              <span>+{tournament.xpReward.toLocaleString()} XP</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {error && (
              <p className="w-full text-sm text-rose-400">{error}</p>
            )}
            {joined && tournament.status === "UPCOMING" ? (
              <button 
                onClick={(e) => { e.stopPropagation(); handleLeave(); }}
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 px-4 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <LogOut size={16} />
                    Leave Tournament
                  </>
                )}
              </button>
            ) : joined ? (
              <button 
                disabled
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-500/30 px-4 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-emerald-400 cursor-default"
              >
                <Check size={16} />
                Joined
              </button>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); handleJoin(); }}
                disabled={isLoading || tournament.currentParticipants >= tournament.maxParticipants}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg transition",
                  tournament.currentParticipants >= tournament.maxParticipants
                    ? "bg-rose-500/20 border border-rose-500/30 text-rose-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400"
                )}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : tournament.currentParticipants >= tournament.maxParticipants ? (
                  t.tournaments.full
                ) : (
                  t.tournaments.joinNow
                )}
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowLeaderboard(true); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-white/80 transition hover:bg-white/10"
            >
              <span className="sm:hidden">{t.tournaments.leaderboard}</span>
              <span className="hidden sm:inline">{t.tournaments.viewLeaderboard}</span>
              <ChevronRight size={14} className="sm:hidden" />
              <ChevronRight size={16} className="hidden sm:block" />
            </button>
          </div>
        </div>
        
        {/* Right Content - Countdown */}
        <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl lg:min-w-[240px]">
          <Clock size={20} className="text-white/50 mb-2 sm:mb-3 sm:hidden" />
          <Clock size={24} className="text-white/50 mb-3 hidden sm:block" />
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50 mb-3 sm:mb-4">{t.tournaments.timeRemaining}</p>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10">
                <span className="text-lg sm:text-2xl font-bold text-white">{timeLeft.days}</span>
              </div>
              <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-white/50">{t.common.days}</p>
            </div>
            <div>
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10">
                <span className="text-lg sm:text-2xl font-bold text-white">{timeLeft.hours}</span>
              </div>
              <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-white/50">{t.common.hours}</p>
            </div>
            <div>
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10">
                <span className="text-lg sm:text-2xl font-bold text-white">{timeLeft.mins}</span>
              </div>
              <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-white/50">{t.tournaments.mins}</p>
            </div>
          </div>
          
          {/* Top Participants Preview */}
          {tournament.topParticipants.length > 0 && (
            <div className="mt-4 sm:mt-6 w-full">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50 mb-2 sm:mb-3 text-center">{t.tournaments.currentLeaders}</p>
              <div className="flex justify-center -space-x-2 sm:-space-x-3">
                {tournament.topParticipants.slice(0, 3).map((participant, index) => (
                  <div 
                    key={participant.id}
                    className={cn(
                      "relative h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 overflow-hidden",
                      index === 0 && "border-amber-400 z-30",
                      index === 1 && "border-slate-300 z-20",
                      index === 2 && "border-orange-500 z-10"
                    )}
                  >
                    <Image
                      src={participant.avatarUrl}
                      alt={participant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Modal */}
      <TournamentLeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        tournamentId={tournament.id}
        tournamentTitle={tournament.title}
        currentUserId={user?.id}
      />

      {/* Tournament Details Modal */}
      <TournamentDetailsModal
        tournament={tournament}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </motion.div>
  );
}
