'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import { TournamentParticipant } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TournamentLeaderboardProps {
  participants: TournamentParticipant[];
  title?: string;
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        bg: "bg-gradient-to-br from-amber-400 to-amber-600",
        border: "border-amber-400/50",
        icon: <Crown size={14} className="text-amber-900" />,
      };
    case 2:
      return {
        bg: "bg-gradient-to-br from-slate-300 to-slate-400",
        border: "border-slate-300/50",
        icon: <Medal size={14} className="text-slate-700" />,
      };
    case 3:
      return {
        bg: "bg-gradient-to-br from-orange-500 to-orange-700",
        border: "border-orange-500/50",
        icon: <Medal size={14} className="text-orange-900" />,
      };
    default:
      return {
        bg: "bg-gradient-to-br from-slate-600 to-slate-700",
        border: "border-slate-600/50",
        icon: null,
      };
  }
};

export function TournamentLeaderboard({ participants, title = "Leaderboard" }: TournamentLeaderboardProps) {
  if (participants.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Trophy size={16} className="text-brand-400 sm:hidden" />
          <Trophy size={20} className="text-brand-400 hidden sm:block" />
          <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-white/40">
          <Trophy size={32} className="mb-3 opacity-50 sm:hidden" />
          <Trophy size={40} className="mb-3 opacity-50 hidden sm:block" />
          <p className="text-sm sm:text-base">Tournament hasn't started yet</p>
          <p className="text-xs sm:text-sm">Check back when the competition begins!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Trophy size={16} className="text-brand-400 sm:hidden" />
        <Trophy size={20} className="text-brand-400 hidden sm:block" />
        <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
      </div>
      
      <div className="space-y-2">
        {participants.map((participant, index) => {
          const rankStyle = getRankStyle(participant.rank);
          
          return (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl border p-2 sm:p-3 transition hover:bg-white/5",
                participant.rank <= 3 ? rankStyle.border : "border-white/5"
              )}
            >
              {/* Rank */}
              <div className={cn(
                "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold",
                rankStyle.bg,
                participant.rank <= 3 ? "text-white" : "text-white/80"
              )}>
                {rankStyle.icon || participant.rank}
              </div>
              
              {/* Avatar */}
              <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-lg sm:rounded-xl">
                <Image
                  src={participant.avatarUrl}
                  alt={participant.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-white truncate">{participant.name}</p>
              </div>
              
              {/* Score */}
              <div className="text-right">
                <p className={cn(
                  "text-base sm:text-lg font-bold",
                  participant.rank === 1 && "text-amber-400",
                  participant.rank === 2 && "text-slate-300",
                  participant.rank === 3 && "text-orange-400",
                  participant.rank > 3 && "text-white"
                )}>
                  {participant.score.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs text-white/40">points</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
