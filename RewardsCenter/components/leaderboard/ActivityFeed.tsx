'use client';

import { motion } from "framer-motion";
import { Trophy, Camera, Gift, Award, Flame } from "lucide-react";
import { ActivityFeedItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface ActivityFeedProps {
  items: ActivityFeedItem[];
}

const getIconForType = (type: string) => {
  switch (type) {
    case "WINNER":
    case "FINALIST":
    case "SEMIFINALIST":
      return <Trophy size={16} className="text-white" />;
    case "REDEMPTION":
      return <Gift size={16} className="text-white" />;
    case "ACHIEVEMENT":
      return <Award size={16} className="text-white" />;
    default:
      return <Trophy size={16} className="text-white" />;
  }
};

const getSmallIconForType = (type: string) => {
  switch (type) {
    case "WINNER":
    case "FINALIST":
    case "SEMIFINALIST":
      return <Trophy size={12} className="text-white" />;
    case "REDEMPTION":
      return <Gift size={12} className="text-white" />;
    case "ACHIEVEMENT":
      return <Award size={12} className="text-white" />;
    default:
      return <Trophy size={12} className="text-white" />;
  }
};

// Format relative time
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const ActivityCard = ({ item, t }: { item: ActivityFeedItem; t: any }) => {
  const isLowOpacity = item.type === "PERSONAL_BEST";
  const isRedemption = item.type === "REDEMPTION";
  const isAchievement = item.type === "ACHIEVEMENT";
  
  // Format relative time with translations
  const formatRelativeTimeTranslated = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return t.leaderboard.activity.justNow;
    if (diffInSeconds < 3600) return t.leaderboard.activity.minutesAgo.replace('{minutes}', Math.floor(diffInSeconds / 60).toString());
    if (diffInSeconds < 86400) return t.leaderboard.activity.hoursAgo.replace('{hours}', Math.floor(diffInSeconds / 3600).toString());
    if (diffInSeconds < 604800) return t.leaderboard.activity.daysAgo.replace('{days}', Math.floor(diffInSeconds / 86400).toString());
    return date.toLocaleDateString();
  };
  
  // Get translated label for coins/rewards
  const getRewardLabel = () => {
    if (item.isMonetary) return t.leaderboard.activity.prize;
    if (isRedemption) return t.leaderboard.activity.spent;
    return t.common.coins;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isLowOpacity ? 0.4 : 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 backdrop-blur-xl transition hover:scale-[1.02]",
        isLowOpacity 
          ? "border-white/5 bg-slate-800/40" 
          : "border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      )}
      style={{
        background: isLowOpacity 
          ? `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`
          : `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
      }}
    >
      <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-white/20">
              <span className="sm:hidden">{getSmallIconForType(item.type)}</span>
              <span className="hidden sm:block">{getIconForType(item.type)}</span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-white/90">{item.userName}</span>
            <span className="text-[10px] sm:text-xs text-white/50">{formatRelativeTimeTranslated(item.timestamp)}</span>
          </div>
          
          <div>
            <h3 className="text-base sm:text-xl font-bold text-white">{item.title}</h3>
            {item.subtitle && (
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-white/80">{item.subtitle}</p>
            )}
          </div>

          {(item.coins || item.xpEarned) && !isLowOpacity && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2">
              {item.coins && item.coins > 0 && (
                <>
                  <span className="text-[10px] sm:text-sm uppercase text-white/70">
                    {getRewardLabel()}
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-white">
                    {item.isMonetary ? `$${item.coins}` : item.coins.toLocaleString()}
                  </span>
                </>
              )}
              {item.xpEarned && item.xpEarned > 0 && (
                <span className={cn(
                  "text-[10px] sm:text-sm text-emerald-300",
                  item.coins && item.coins > 0 && "ml-1 sm:ml-2"
                )}>+{item.xpEarned} XP</span>
              )}
            </div>
          )}
        </div>

        <div className="relative h-16 w-16 sm:h-24 sm:w-24 shrink-0">
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.userName)}&backgroundColor=6366f1`}
            alt={item.userName}
            className="relative h-full w-full rounded-xl sm:rounded-2xl object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.userName)}&backgroundColor=6366f1`;
            }}
          />
        </div>
      </div>

      {!isLowOpacity && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          }}
        />
      )}
    </motion.div>
  );
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex-1 space-y-3 sm:space-y-4 lg:max-w-md xl:max-w-lg">
      <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
        <Flame size={18} className="text-orange-500 sm:hidden" />
        <Flame size={20} className="text-orange-500 hidden sm:block" />
        {t.leaderboard.activity.title}
      </h2>
      {items.length > 0 ? (
        items.map((item) => (
          <ActivityCard key={item.id} item={item} t={t} />
        ))
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6 text-center">
          <p className="text-white/60">{t.leaderboard.activity.noActivity}</p>
        </div>
      )}
    </div>
  );
}
