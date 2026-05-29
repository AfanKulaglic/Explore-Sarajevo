'use client';

import { motion } from "framer-motion";
import { TrendingUp, Gift, ShoppingBag, Flame, Trophy, Percent } from "lucide-react";
import { AccountStats } from "@/lib/types";

interface StatsGridProps {
  stats: AccountStats;
}

const statItems = [
  { key: "totalEarned", label: "Total Earned", icon: TrendingUp, color: "from-emerald-500 to-emerald-600", suffix: " coins" },
  { key: "totalRedeemed", label: "Total Redeemed", icon: Gift, color: "from-violet-500 to-violet-600", suffix: " coins" },
  { key: "ordersCompleted", label: "Orders Completed", icon: ShoppingBag, color: "from-blue-500 to-blue-600", suffix: "" },
  { key: "currentStreak", label: "Current Streak", icon: Flame, color: "from-orange-500 to-orange-600", suffix: " days" },
  { key: "rank", label: "Global Rank", icon: Trophy, color: "from-amber-500 to-amber-600", prefix: "#" },
  { key: "percentile", label: "Top Percentile", icon: Percent, color: "from-rose-500 to-rose-600", suffix: "%" },
] as const;

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
    >
      <h3 className="mb-4 sm:mb-5 text-base sm:text-lg font-semibold text-white">Your Statistics</h3>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          const value = stats[item.key];
          
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="flex flex-col items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 p-3 sm:p-4 text-center transition hover:border-white/10 hover:bg-white/10"
            >
              <span className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color}`}>
                <Icon size={16} className="text-white sm:hidden" />
                <Icon size={20} className="text-white hidden sm:block" />
              </span>
              <div className="min-w-0">
                <p className="text-base sm:text-xl font-bold text-white truncate">
                  {'prefix' in item ? item.prefix : ''}{value.toLocaleString()}{'suffix' in item ? item.suffix : ''}
                </p>
                <p className="text-[10px] sm:text-xs text-white/50 truncate">{item.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
