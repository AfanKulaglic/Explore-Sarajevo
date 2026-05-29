'use client';

import { motion } from "framer-motion";
import { Star, Zap, TrendingUp } from "lucide-react";
import { XPProgress } from "@/lib/types";
import { xpForLevel, xpToNextLevel, formatXP } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface XPProgressCardProps {
  xpProgress: XPProgress;
}

export function XPProgressCard({ xpProgress }: XPProgressCardProps) {
  const { t } = useTranslation();
  const currentLevelXP = xpForLevel(xpProgress.level);
  const nextLevelXP = xpForLevel(xpProgress.level + 1);
  const xpInCurrentLevel = xpProgress.currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;
  const xpRemaining = xpToNextLevel(xpProgress.currentXP);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
    >
      {/* Decorative gradient */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <Star size={20} className="text-white sm:hidden" fill="currentColor" />
              <Star size={28} className="text-white hidden sm:block" fill="currentColor" />
            </span>
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50">{t.common.xp}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-3xl font-bold text-white">{t.common.level} {xpProgress.level}</span>
              </div>
            </div>
          </div>
          
          <div className="text-left sm:text-right">
            <p className="text-lg sm:text-2xl font-bold text-emerald-400">{formatXP(xpProgress.currentXP)}</p>
            <p className="text-[10px] sm:text-xs text-white/50">{t.account.totalXp}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/60 mb-2">
            <span>Lv {xpProgress.level}</span>
            <span className="text-emerald-400 hidden sm:block">{xpRemaining.toLocaleString()} XP {t.account.toLevel} {xpProgress.level + 1}</span>
            <span className="text-emerald-400 sm:hidden">{xpRemaining.toLocaleString()} {t.account.toLv} {xpProgress.level + 1}</span>
            <span>Lv {xpProgress.level + 1}</span>
          </div>
          <div className="h-3 sm:h-4 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/40 mt-1">
            <span>{xpInCurrentLevel.toLocaleString()} XP</span>
            <span>{xpNeededForLevel.toLocaleString()} XP</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
