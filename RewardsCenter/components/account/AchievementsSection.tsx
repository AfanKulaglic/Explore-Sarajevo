'use client';

import { motion } from "framer-motion";
import { Achievement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const { t } = useTranslation();
  const unlocked = achievements.filter((a) => a.unlockedAt);
  const inProgress = achievements.filter((a) => !a.unlockedAt && a.progress !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-white">{t.account.achievements}</h3>
        <span className="rounded-full bg-brand-500/20 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-brand-300 whitespace-nowrap">
          {unlocked.length}/{achievements.length} {t.account.unlocked}
        </span>
      </div>

      <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3">
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm">{t.account.noAchievements}</p>
            <p className="text-white/30 text-xs mt-1">{t.account.completeActivities}</p>
          </div>
        ) : achievements.map((achievement, index) => {
          const isUnlocked = !!achievement.unlockedAt;
          const hasProgress = !isUnlocked && achievement.progress !== undefined;
          const progressPercent = hasProgress && achievement.maxProgress
            ? (achievement.progress! / achievement.maxProgress) * 100
            : 0;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={cn(
                "flex items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition",
                isUnlocked
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-white/5 bg-white/5"
              )}
            >
              <span className={cn(
                "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-xl sm:text-2xl",
                isUnlocked ? "bg-emerald-500/20" : "bg-white/10"
              )}>
                {achievement.icon}
              </span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <p className={cn(
                    "text-sm sm:text-base font-semibold truncate",
                    isUnlocked ? "text-white" : "text-white/60"
                  )}>
                    {achievement.title}
                  </p>
                  {isUnlocked && (
                    <CheckCircle size={12} className="text-emerald-400 shrink-0 sm:hidden" />
                  )}
                  {isUnlocked && (
                    <CheckCircle size={14} className="text-emerald-400 shrink-0 hidden sm:block" />
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-white/50 truncate">{achievement.description}</p>
                
                {hasProgress && achievement.maxProgress && (
                  <div className="mt-1.5 sm:mt-2">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/40">
                      <span>{achievement.progress?.toLocaleString()} / {achievement.maxProgress.toLocaleString()}</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="mt-1 h-1 sm:h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {!isUnlocked && !hasProgress && (
                <>
                  <Lock size={14} className="shrink-0 text-white/30 sm:hidden" />
                  <Lock size={16} className="shrink-0 text-white/30 hidden sm:block" />
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}