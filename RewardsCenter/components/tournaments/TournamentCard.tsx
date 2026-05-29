'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Users, Trophy, Zap, Calendar, Coins, Loader2, Check, LogOut, BarChart3 } from "lucide-react";
import { Tournament } from "@/lib/types";
import { cn } from "@/lib/utils";
import { joinTournament, leaveTournament } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import confetti from "canvas-confetti";
import { TournamentLeaderboardModal } from "./TournamentLeaderboardModal";
import { TournamentDetailsModal } from "./TournamentDetailsModal";

interface TournamentCardProps {
  tournament: Tournament;
  featured?: boolean;
  isJoined?: boolean;
  onJoinChange?: () => void;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "LIVE":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "UPCOMING":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "COMPLETED":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "SOLO":
      return "👤";
    case "TEAM":
      return "👥";
    case "BRACKET":
      return "🏆";
    default:
      return "🎮";
  }
};

const formatTimeRemaining = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Ended";
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

const formatStartDate = (startDate: string) => {
  const date = new Date(startDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

export function TournamentCard({ tournament, featured = false, isJoined = false, onJoinChange }: TournamentCardProps) {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [joined, setJoined] = useState(isJoined);
  const [error, setError] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => formatTimeRemaining(tournament.endDate));
  
  const participantPercent = (tournament.currentParticipants / tournament.maxParticipants) * 100;

  // Update time remaining every second for live tournaments
  useEffect(() => {
    if (tournament.status !== "LIVE") return;
    
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(tournament.endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament.endDate, tournament.status]);

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
      // Celebrate!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.5, y: 0.7 },
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
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => setShowDetails(true)}
      className={cn(
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-2xl transition-all hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10 cursor-pointer",
        featured && "lg:col-span-2"
      )}
    >
      {/* Image Section */}
      <div className={cn("relative", featured ? "h-40 sm:h-56" : "h-32 sm:h-44")}>
        <Image
          src={tournament.imageUrl}
          alt={tournament.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center gap-1.5 sm:gap-2">
          <span className={cn(
            "flex items-center gap-1 sm:gap-1.5 rounded-full border px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider",
            getStatusStyle(tournament.status)
          )}>
            {tournament.status === "LIVE" && (
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500" />
              </span>
            )}
            {tournament.status}
          </span>
          <span className="rounded-full border border-white/10 bg-slate-900/80 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white backdrop-blur-xl">
            {getTypeIcon(tournament.type)} <span className="hidden sm:inline">{tournament.type}</span>
          </span>
        </div>
        
        {/* Featured Badge */}
        {tournament.featured && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white shadow-lg">
              <Zap size={10} className="sm:hidden" />
              <Zap size={12} className="hidden sm:block" />
              <span className="hidden sm:inline">FEATURED</span>
              <span className="sm:hidden">★</span>
            </span>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="relative p-3 sm:p-5">
        <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
          {tournament.title}
        </h3>
        <p className="mt-1 sm:mt-2 line-clamp-2 text-xs sm:text-sm text-white/60">
          {tournament.description}
        </p>
        
        {/* Prize Pool */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-amber-500/20 bg-amber-500/10 px-2 sm:px-3 py-1.5 sm:py-2">
            <Trophy size={14} className="text-amber-400 sm:hidden" />
            <Trophy size={16} className="text-amber-400 hidden sm:block" />
            <div>
              <p className="text-[10px] sm:text-xs text-white/50">1st Prize</p>
              <p className="text-xs sm:text-sm font-bold text-amber-400">
                {(tournament.prizes?.[0]?.coins ?? 0).toLocaleString()} coins
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-2 sm:px-3 py-1.5 sm:py-2">
            <Zap size={14} className="text-emerald-400 sm:hidden" />
            <Zap size={16} className="text-emerald-400 hidden sm:block" />
            <div>
              <p className="text-[10px] sm:text-xs text-white/50">XP Reward</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-400">
                +{tournament.xpReward.toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3 text-[10px] sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2 text-white/60">
            <Users size={12} className="sm:hidden" />
            <Users size={14} className="hidden sm:block" />
            <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-white/60">
            {tournament.status === "UPCOMING" ? (
              <>
                <Calendar size={12} className="sm:hidden" />
                <Calendar size={14} className="hidden sm:block" />
                <span className="truncate">{formatStartDate(tournament.startDate)}</span>
              </>
            ) : (
              <>
                <Clock size={12} className="sm:hidden" />
                <Clock size={14} className="hidden sm:block" />
                <span className="truncate">{timeRemaining}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-white/60">
            <Coins size={12} className="sm:hidden" />
            <Coins size={14} className="hidden sm:block" />
            <span>{tournament.entryFee === 0 ? "Free" : `${tournament.entryFee}`}</span>
          </div>
        </div>
        
        {/* Participant Progress */}
        <div className="mt-3 sm:mt-4">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/50 mb-1 sm:mb-1.5">
            <span>Participants</span>
            <span>{Math.round(participantPercent)}% full</span>
          </div>
          <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
              style={{ width: `${participantPercent}%` }}
            />
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="mt-2 text-xs text-rose-400 text-center">{error}</p>
        )}
        
        {/* Action Button */}
        {joined && tournament.status === "UPCOMING" ? (
          <button 
            onClick={(e) => { e.stopPropagation(); handleLeave(); }}
            disabled={isLoading}
            className="mt-3 sm:mt-5 w-full rounded-xl sm:rounded-2xl py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-all border border-white/20 bg-white/5 text-white hover:bg-white/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <LogOut size={14} />
                Leave Tournament
              </>
            )}
          </button>
        ) : joined ? (
          <button 
            disabled
            className="mt-3 sm:mt-5 w-full rounded-xl sm:rounded-2xl py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-all bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default flex items-center justify-center gap-2"
          >
            <Check size={14} />
            {t.tournaments.joined}
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); handleJoin(); }}
            disabled={isLoading || tournament.status === "COMPLETED" || tournament.currentParticipants >= tournament.maxParticipants}
            className={cn(
              "mt-3 sm:mt-5 w-full rounded-xl sm:rounded-2xl py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2",
              tournament.status === "COMPLETED"
                ? "border border-white/10 bg-white/5 text-white/50 cursor-not-allowed"
                : tournament.currentParticipants >= tournament.maxParticipants
                ? "border border-rose-500/20 bg-rose-500/10 text-rose-400 cursor-not-allowed"
                : tournament.status === "LIVE"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400"
                : "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-brand-400"
            )}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : tournament.status === "COMPLETED" ? (
              t.tournaments.viewResults
            ) : tournament.currentParticipants >= tournament.maxParticipants ? (
              t.tournaments.full
            ) : tournament.status === "LIVE" ? (
              t.tournaments.joinNow
            ) : (
              t.tournaments.register
            )}
          </button>
        )}

        {/* Leaderboard Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowLeaderboard(true); }}
          className="mt-2 w-full rounded-xl sm:rounded-2xl py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white flex items-center justify-center gap-2"
        >
          <BarChart3 size={14} />
          {t.tournaments.viewLeaderboard}
        </button>
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
