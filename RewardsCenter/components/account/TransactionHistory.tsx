'use client';

import { motion } from "framer-motion";
import { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Gift, RotateCcw, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "EARNED":
      return ArrowUpRight;
    case "REDEEMED":
      return ArrowDownRight;
    case "BONUS":
      return Gift;
    case "REFUND":
      return RotateCcw;
    default:
      return ArrowUpRight;
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case "EARNED":
      return "text-emerald-400 bg-emerald-500/20";
    case "REDEEMED":
      return "text-rose-400 bg-rose-500/20";
    case "BONUS":
      return "text-amber-400 bg-amber-500/20";
    case "REFUND":
      return "text-blue-400 bg-blue-500/20";
    default:
      return "text-white/60 bg-white/10";
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-white">{t.account.recentTransactions}</h3>
        <button className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium text-brand-400 transition hover:text-brand-300 whitespace-nowrap">
          {t.account.viewAll}
          <ChevronRight size={12} className="sm:hidden" />
          <ChevronRight size={14} className="hidden sm:block" />
        </button>
      </div>

      <div className="mt-4 sm:mt-5 space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm">{t.account.noTransactions}</p>
            <p className="text-white/30 text-xs mt-1">{t.account.transactionHistoryAppear}</p>
          </div>
        ) : transactions.map((transaction, index) => {
          const Icon = getTransactionIcon(transaction.type);
          const colorClass = getTransactionColor(transaction.type);
          const amount = transaction.amount ?? 0;
          const isPositive = amount > 0;

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 p-3 sm:p-4 transition hover:border-white/10 hover:bg-white/10"
            >
              <span className={cn(
                "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl",
                colorClass
              )}>
                <Icon size={14} className="sm:hidden" />
                <Icon size={18} className="hidden sm:block" />
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-white truncate">{transaction.title}</p>
                <p className="text-[10px] sm:text-xs text-white/50 truncate">{transaction.description}</p>
              </div>

              <div className="text-right shrink-0">
                <p className={cn(
                  "text-sm sm:text-base font-semibold",
                  isPositive ? "text-emerald-400" : "text-rose-400"
                )}>
                  {isPositive ? "+" : ""}{amount.toLocaleString()}
                  <span className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs text-white/50">
                    {transaction.currency === "COINS" ? "coins" : "tok"}
                  </span>
                </p>
                <p className="text-[10px] sm:text-xs text-white/40">{formatTimeAgo(transaction.timestamp)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}