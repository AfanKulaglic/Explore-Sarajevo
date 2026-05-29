'use client';

import { motion } from "framer-motion";
import { Crown, Coins } from "lucide-react";
import { UserWallet } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface WalletCardProps {
  wallet: UserWallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
    >
      {/* Decorative gradient */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/30 to-emerald-500/20 blur-3xl" />

      <div className="relative">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">{t.account.yourWallet}</h3>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Coins */}
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600/20 to-brand-500/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600">
                <Crown size={18} className="text-white sm:hidden" />
                <Crown size={22} className="text-white hidden sm:block" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50">{t.account.coins}</p>
                <p className="text-xl sm:text-3xl font-bold text-white truncate" title={wallet.coins.toLocaleString()}>
                  {wallet.coins.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tokens */}
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/20 to-amber-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500">
                <Coins size={18} className="text-white sm:hidden" />
                <Coins size={22} className="text-white hidden sm:block" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50">{t.account.tokens}</p>
                <p className="text-xl sm:text-3xl font-bold text-white truncate" title={wallet.tokens.toLocaleString()}>
                  {wallet.tokens.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
