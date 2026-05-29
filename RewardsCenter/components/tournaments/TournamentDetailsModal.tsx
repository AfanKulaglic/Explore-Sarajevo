'use client';

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  X, 
  Trophy, 
  Users, 
  Clock, 
  Calendar, 
  Coins, 
  Zap, 
  Target,
  CheckCircle2,
  Medal,
  Award,
  Gift
} from "lucide-react";
import { Tournament } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface TournamentDetailsModalProps {
  tournament: Tournament | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "LIVE":
      return "bg-emerald-500 text-white";
    case "UPCOMING":
      return "bg-amber-500 text-white";
    case "COMPLETED":
      return "bg-slate-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "SOLO":
      return "Solo Competition";
    case "TEAM":
      return "Team Battle";
    case "BRACKET":
      return "Bracket Tournament";
    default:
      return type;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    hour: "numeric", 
    minute: "2-digit" 
  });
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

// Rules for how to earn points based on tournament type
const getRulesForType = (type: string) => {
  switch (type) {
    case "SOLO":
      return [
        "Earn points by completing daily sales targets",
        "Each closed sale adds points based on value",
        "Bonus multiplier for exceeding daily quota",
        "Talk-offs and customer callbacks earn extra points",
        "Consistent daily activity maintains your ranking"
      ];
    case "TEAM":
      return [
        "Team scores combine all members' contributions",
        "Individual sales contribute to team total",
        "Coordination bonus for team milestones",
        "Support assists count toward team score",
        "Top performing team members earn MVP bonus"
      ];
    case "BRACKET":
      return [
        "Single elimination format - win to advance",
        "Match winners determined by daily sales total",
        "Bracket seeded by current rank at start",
        "Advance through rounds to reach finals",
        "Final match winner takes the grand prize"
      ];
    default:
      return [
        "Complete assigned tasks to earn points",
        "Higher value activities earn more points",
        "Daily activity streaks boost your score",
        "Performance bonuses for top rankings",
        "Check leaderboard for current standings"
      ];
  }
};

export function TournamentDetailsModal({ tournament, isOpen, onClose }: TournamentDetailsModalProps) {
  const { t } = useTranslation();
  
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

  if (!tournament) return null;

  // Get type label with translations
  const getTypeLabelTranslated = (type: string) => {
    switch (type) {
      case "SOLO":
        return t.tournaments.soloCompetition;
      case "TEAM":
        return t.tournaments.teamCompetition;
      case "BRACKET":
        return t.tournaments.bracketCompetition;
      default:
        return type;
    }
  };

  // Rules for how to earn points based on tournament type with translations
  const getRulesTranslated = (type: string) => {
    switch (type) {
      case "SOLO":
        return [
          t.tournaments.rules_solo_1,
          t.tournaments.rules_solo_2,
          t.tournaments.rules_solo_3,
          t.tournaments.rules_solo_4,
          t.tournaments.rules_solo_5
        ];
      case "TEAM":
        return [
          t.tournaments.rules_team_1,
          t.tournaments.rules_team_2,
          t.tournaments.rules_team_3,
          t.tournaments.rules_team_4,
          t.tournaments.rules_team_5
        ];
      case "BRACKET":
        return [
          t.tournaments.rules_bracket_1,
          t.tournaments.rules_bracket_2,
          t.tournaments.rules_bracket_3,
          t.tournaments.rules_bracket_4,
          t.tournaments.rules_bracket_5
        ];
      default:
        return [
          t.tournaments.rules_default_1,
          t.tournaments.rules_default_2,
          t.tournaments.rules_default_3,
          t.tournaments.rules_default_4,
          t.tournaments.rules_default_5
        ];
    }
  };

  const rules = tournament.rules?.length > 0 ? tournament.rules : getRulesTranslated(tournament.type);
  const totalPrizePool = tournament.prizes?.reduce((sum, p) => sum + (p.coins || 0), 0) || 0;

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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Header Background - Gradient like user profile */}
              <div className="relative h-28 bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600">
                <Image
                  src={tournament.imageUrl}
                  alt={tournament.title}
                  fill
                  className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                
                {/* Close button */}
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose(); }}
                  className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 active:scale-95"
                >
                  <X size={18} />
                </button>

                {/* Status Badge */}
                <div className={cn(
                  "absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-lg",
                  getStatusStyle(tournament.status)
                )}>
                  {tournament.status === "LIVE" && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                  )}
                  {tournament.status === "LIVE" ? t.tournaments.live : tournament.status === "UPCOMING" ? t.tournaments.upcoming.toUpperCase() : t.tournaments.ended.toUpperCase()}
                </div>
              </div>

              {/* Tournament Icon - Overlapping header like avatar */}
              <div className="relative -mt-12 px-6">
                <div className="relative inline-block">
                  <div className="h-[72px] w-[72px] rounded-2xl border-4 border-slate-900 bg-slate-800 overflow-hidden">
                    <Image
                      src={tournament.imageUrl}
                      alt={tournament.title}
                      width={72}
                      height={72}
                      className="object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-500 text-xs">
                    🏆
                  </span>
                </div>
              </div>

              {/* Tournament Info */}
              <div className="px-6 pt-3 pb-5">
                <h2 className="text-xl font-bold text-white">{tournament.title}</h2>
                <p className="text-sm text-white/50">{getTypeLabelTranslated(tournament.type)}</p>

                {/* Schedule */}
                <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                  <Calendar size={12} />
                  <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                </div>

                {/* Stats Grid - Like user profile (Coins, XP, Streak) */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400">
                      <Users size={14} />
                      <span className="font-bold">{tournament.currentParticipants}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">{t.tournaments.players}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-400">
                      <Coins size={14} />
                      <span className="font-bold">{tournament.entryFee === 0 ? t.tournaments.free : tournament.entryFee}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">{t.tournaments.entry}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-400">
                      <Zap size={14} />
                      <span className="font-bold">+{tournament.xpReward}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">XP</p>
                  </div>
                </div>

                {/* Prizes - Like Badges section */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-white/50">{t.tournaments.prizes}</p>
                  <div className="flex gap-2">
                    {tournament.prizes?.slice(0, 3).map((prize, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl text-white text-lg",
                          index === 0 && "bg-gradient-to-br from-amber-400 to-yellow-500",
                          index === 1 && "bg-gradient-to-br from-slate-300 to-slate-400",
                          index === 2 && "bg-gradient-to-br from-amber-600 to-amber-700"
                        )}
                        title={`${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}: ${prize.coins} coins`}
                      >
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </div>
                    ))}
                    <div className="flex h-9 items-center justify-center rounded-xl bg-white/5 px-3 text-xs text-amber-400 font-semibold">
                      {totalPrizePool.toLocaleString()} {t.account.coins.toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* Activity Stats - Like user profile 2x2 grid */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-white/70">
                      <Trophy size={14} className="text-amber-400" />
                      {t.tournaments.firstPrize}
                    </span>
                    <span className="font-bold text-white">{tournament.prizes?.[0]?.coins || 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-white/70">
                      <Gift size={14} className="text-emerald-400" />
                      {t.tournaments.secondPrize}
                    </span>
                    <span className="font-bold text-white">{tournament.prizes?.[1]?.coins || 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-white/70">
                      <Medal size={14} className="text-orange-400" />
                      {t.tournaments.thirdPrize}
                    </span>
                    <span className="font-bold text-white">{tournament.prizes?.[2]?.coins || 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-white/70">
                      <Users size={14} className="text-blue-400" />
                      {t.tournaments.maxPlayers}
                    </span>
                    <span className="font-bold text-white">{tournament.maxParticipants}</span>
                  </div>
                </div>

                {/* How to Earn Points */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-white/50">{t.tournaments.howToEarnPoints}</p>
                  <div className="space-y-1.5">
                    {rules.slice(0, 4).map((rule, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2 text-xs text-white/60"
                      >
                        <CheckCircle2 size={12} className="text-brand-400 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time remaining banner */}
                {tournament.status === "LIVE" && (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2.5">
                    <Clock size={14} className="text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                      {formatTimeRemaining(tournament.endDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}