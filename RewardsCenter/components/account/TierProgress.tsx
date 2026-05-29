'use client';

import { motion } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";
import { AccountProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface TierProgressProps {
  profile: AccountProfile;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case "DIAMOND":
      return "from-cyan-400 to-blue-500";
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

const getNextTier = (tier: string) => {
  switch (tier) {
    case "BRONZE":
      return "SILVER";
    case "SILVER":
      return "GOLD";
    case "GOLD":
      return "PLATINUM";
    case "PLATINUM":
      return "DIAMOND";
    default:
      return "MAX";
  }
};

export function TierProgress({ profile }: TierProgressProps) {
  const { t } = useTranslation();
  const progress = (profile.tierProgress / profile.tierNextThreshold) * 100;
  const remaining = profile.tierNextThreshold - profile.tierProgress;
  const nextTier = getNextTier(profile.tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-5 backdrop-blur-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={cn(
            "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br",
            getTierColor(profile.tier)
          )}>
            <TrendingUp size={14} className="text-white sm:hidden" />
            <TrendingUp size={18} className="text-white hidden sm:block" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{t.account.tierProgress}</p>
            <p className="text-xs text-white/50">{profile.tier} → {nextTier}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/50">
          <span>{profile.tierProgress.toLocaleString()} coins</span>
          <span>{profile.tierNextThreshold.toLocaleString()} coins</span>
        </div>
        <div className="mt-1 sm:mt-1.5 h-2 sm:h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full bg-gradient-to-r",
              getTierColor(profile.tier)
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}
