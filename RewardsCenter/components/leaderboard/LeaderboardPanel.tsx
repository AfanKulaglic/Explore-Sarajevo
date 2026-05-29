'use client';

import { useState } from "react";
import { Trophy, Star, ChevronDown, StarHalf } from "lucide-react";
import { LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UserProfileModal } from "./UserProfileModal";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { UserAvatar } from "@/components/common/UserAvatar";

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
}

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case "DIAMOND":
      return "from-cyan-400 to-blue-400";
    case "PLATINUM":
      return "from-teal-300 to-emerald-400";
    case "GOLD":
      return "from-amber-400 to-yellow-500";
    case "SILVER":
      return "from-slate-300 to-slate-400";
    case "BRONZE":
      return "from-orange-600 to-amber-700";
    default:
      return "from-slate-400 to-slate-500";
  }
};

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "from-pink-500 via-orange-400 to-yellow-400";
    case 2:
      return "from-rose-400 via-pink-400 to-orange-300";
    case 3:
      return "from-amber-400 via-orange-400 to-yellow-300";
    default:
      return "from-slate-500 to-slate-600";
  }
};

const getRankBadgeStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-amber-900";
    case 2:
      return "bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-slate-700";
    case 3:
      return "bg-gradient-to-b from-orange-400 via-orange-500 to-orange-700 text-orange-900";
    default:
      return "bg-gradient-to-b from-slate-500 to-slate-700 text-white";
  }
};

const getBottomSectionStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700";
    case 2:
      return "bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500";
    case 3:
      return "bg-gradient-to-b from-orange-600 via-orange-700 to-orange-800";
    default:
      return "bg-slate-800";
  }
};

const getTextColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "text-amber-950";
    case 2:
      return "text-slate-800";
    case 3:
      return "text-orange-950";
    default:
      return "text-white";
  }
};

const TopThreeCard = ({ entry, size, onClick, levelLabel }: { entry: LeaderboardEntry; size: "lg" | "md" | "sm"; onClick: () => void; levelLabel: string }) => {
  const sizeClasses = {
    lg: "h-32 sm:h-48",
    md: "h-28 sm:h-40",
    sm: "h-24 sm:h-36",
  };
  
  const textColor = getTextColor(entry.rank);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 transition-transform hover:scale-[1.02]",
        size === "lg" && "z-10"
      )}
    >
      {/* Top section with gradient background and image */}
      <div className="relative">
        {/* Background gradient */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            getRankBadgeColor(entry.rank)
          )} 
        />
        
        {/* Rank badge - top left */}
        <div className={cn(
          "absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-20 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl text-sm sm:text-lg font-black shadow-lg",
          getRankBadgeStyle(entry.rank)
        )}>
          {entry.rank}
        </div>
        
        {/* Avatar/Image */}
        <div className={cn("relative w-full", sizeClasses[size])}>
          <UserAvatar
            src={entry.avatarUrl}
            name={entry.name}
            fill
            sizes="(max-width: 640px) 120px, 192px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Bottom section - Gold/Silver/Bronze */}
      <div className={cn(
        "relative z-10 flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 sm:py-3",
        getBottomSectionStyle(entry.rank)
      )}>
        {/* Star rating with half star support */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const starIndex = i + 1;
            const isFull = entry.rating >= starIndex;
            const isHalf = !isFull && entry.rating >= starIndex - 0.5;
            
            return (
              <span key={i} className="relative sm:hidden">
                {isHalf ? (
                  <StarHalf size={8} className="fill-slate-900/80 text-slate-900/80" />
                ) : (
                  <Star
                    size={8}
                    className={cn(
                      isFull
                        ? "fill-slate-900/80 text-slate-900/80"
                        : "fill-white/40 text-white/40"
                    )}
                  />
                )}
              </span>
            );
          })}
          {Array.from({ length: 5 }).map((_, i) => {
            const starIndex = i + 1;
            const isFull = entry.rating >= starIndex;
            const isHalf = !isFull && entry.rating >= starIndex - 0.5;
            
            return (
              <span key={`lg-${i}`} className="relative hidden sm:block">
                {isHalf ? (
                  <StarHalf size={10} className="fill-slate-900/80 text-slate-900/80" />
                ) : (
                  <Star
                    size={10}
                    className={cn(
                      isFull
                        ? "fill-slate-900/80 text-slate-900/80"
                        : "fill-white/40 text-white/40"
                    )}
                  />
                )}
              </span>
            );
          })}
        </div>
        
        <p className={cn("text-xs sm:text-sm font-semibold truncate max-w-full", textColor)}>{entry.name}</p>
        <p className={cn("text-sm sm:text-lg font-bold", textColor)}>{entry.coins.toLocaleString()}</p>
        <p className={cn("text-[10px] sm:text-xs opacity-80", textColor)}>{levelLabel} {entry.level}</p>
        
        {/* Trophy badges */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg bg-slate-900/30">
            <Trophy size={10} className={cn("sm:hidden", textColor)} />
            <Trophy size={12} className={cn("hidden sm:block", textColor)} />
          </div>
          <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg bg-slate-900/30">
            <Trophy size={10} className={cn("sm:hidden", textColor)} />
            <Trophy size={12} className={cn("hidden sm:block", textColor)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const RankedRow = ({ entry, onClick, levelLabel }: { entry: LeaderboardEntry; onClick: () => void; levelLabel: string }) => {
  return (
    <div 
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 p-2 sm:p-3 backdrop-blur-xl transition hover:border-brand-500/40 hover:bg-white/10"
    >
      <span className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-xs sm:text-sm font-bold text-white">
        {entry.rank}
      </span>
      
      <UserAvatar
        src={entry.avatarUrl}
        name={entry.name}
        width={40}
        height={40}
        className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl object-cover"
      />

      <div className={cn(
        "hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
        getBadgeColor(entry.badge)
      )}>
        <Trophy size={14} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm sm:text-base font-medium text-white">{entry.name}</p>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const starIndex = i + 1;
            const isFull = entry.rating >= starIndex;
            const isHalf = !isFull && entry.rating >= starIndex - 0.5;
            
            return (
              <span key={i} className="sm:hidden">
                {isHalf ? (
                  <StarHalf size={8} className="fill-amber-400 text-amber-400" />
                ) : (
                  <Star
                    size={8}
                    className={cn(
                      isFull ? "fill-amber-400 text-amber-400" : "text-white/20"
                    )}
                  />
                )}
              </span>
            );
          })}
          {Array.from({ length: 5 }).map((_, i) => {
            const starIndex = i + 1;
            const isFull = entry.rating >= starIndex;
            const isHalf = !isFull && entry.rating >= starIndex - 0.5;
            
            return (
              <span key={`lg-${i}`} className="hidden sm:block">
                {isHalf ? (
                  <StarHalf size={10} className="fill-amber-400 text-amber-400" />
                ) : (
                  <Star
                    size={10}
                    className={cn(
                      isFull ? "fill-amber-400 text-amber-400" : "text-white/20"
                    )}
                  />
                )}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="text-right">
          <span className="text-xs sm:text-sm font-semibold text-white">{entry.coins.toLocaleString()}</span>
          <p className="text-[10px] sm:text-xs text-white/50">{levelLabel} {entry.level}</p>
        </div>
        <div className={cn(
          "flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg bg-gradient-to-br",
          getBadgeColor(entry.badge)
        )}>
          <Trophy size={10} className="text-white sm:hidden" />
          <Trophy size={12} className="text-white hidden sm:block" />
        </div>
      </div>
    </div>
  );
};

export function LeaderboardPanel({ entries }: LeaderboardPanelProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreRankingsExpanded, setIsMoreRankingsExpanded] = useState(false);

  const topThree = entries.slice(0, 3);
  const topTenRest = entries.slice(3, 10); // Ranks 4-10
  const remaining = entries.slice(10); // Ranks 11+

  // Reorder for Olympic podium: 2nd (left), 1st (center), 3rd (right)
  const first = topThree.find(e => e.rank === 1);
  const second = topThree.find(e => e.rank === 2);
  const third = topThree.find(e => e.rank === 3);

  const handleUserClick = (entry: LeaderboardEntry) => {
    setSelectedUser(entry);
    setIsModalOpen(true);
  };

  // Short level label
  const levelLabel = t.leaderboard.level.substring(0, 3);

  return (
    <>
      <aside className="flex w-full flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl lg:w-[520px] xl:w-[560px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{t.nav.leaderboard}</h2>
        </div>

        {/* Olympic podium layout: 2nd | 1st | 3rd */}
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {/* 2nd place - left, medium size */}
          {second && (
            <div className="w-[30%] pt-4 sm:pt-6">
              <TopThreeCard entry={second} size="md" onClick={() => handleUserClick(second)} levelLabel={levelLabel} />
            </div>
          )}
          
          {/* 1st place - center, largest */}
          {first && (
            <div className="w-[38%]">
              <TopThreeCard entry={first} size="lg" onClick={() => handleUserClick(first)} levelLabel={levelLabel} />
            </div>
          )}
          
          {/* 3rd place - right, smallest */}
          {third && (
            <div className="w-[28%] pt-6 sm:pt-10">
              <TopThreeCard entry={third} size="sm" onClick={() => handleUserClick(third)} levelLabel={levelLabel} />
            </div>
          )}
        </div>

        {/* Top 10 (ranks 4-10) - always visible */}
        {topTenRest.length > 0 && (
          <div className="space-y-1.5 sm:space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider">Top 10</h3>
            {topTenRest.map((entry) => (
              <RankedRow key={entry.id} entry={entry} onClick={() => handleUserClick(entry)} levelLabel={levelLabel} />
            ))}
          </div>
        )}

        {/* Remaining users (11-100) - collapsible and scrollable */}
        {remaining.length > 0 && (
          <div className="space-y-2">
            <button 
              onClick={() => setIsMoreRankingsExpanded(!isMoreRankingsExpanded)}
              className="flex w-full items-center justify-between text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider hover:text-white/80 transition-colors"
            >
              <span>{t.leaderboard.moreRankings} ({remaining.length})</span>
              <ChevronDown 
                size={16} 
                className={cn(
                  "transition-transform duration-200",
                  isMoreRankingsExpanded && "rotate-180"
                )} 
              />
            </button>
            {isMoreRankingsExpanded && (
              <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 scrollbar-hover">
                {remaining.map((entry) => (
                  <RankedRow key={entry.id} entry={entry} onClick={() => handleUserClick(entry)} levelLabel={levelLabel} />
                ))}
              </div>
            )}
          </div>
        )}
      </aside>

      <UserProfileModal
        user={selectedUser ? {
          id: selectedUser.id,
          rank: selectedUser.rank,
          name: selectedUser.name,
          handle: `@${selectedUser.name.toLowerCase().replace(' ', '')}`,
          avatarUrl: selectedUser.avatarUrl,
          coins: selectedUser.coins,
          xp: selectedUser.xp,
          level: selectedUser.level,
          streak: selectedUser.streak,
        } : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId={user?.id}
      />
    </>
  );
}
