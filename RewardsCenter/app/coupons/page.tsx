'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket, 
  Gift, 
  Sparkles,
  Clock,
  CheckCircle,
  Copy,
  Coins,
  Star,
  Loader2,
  AlertCircle,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { useTranslation } from "@/lib/i18n";
import confetti from "canvas-confetti";

interface CouponUse {
  id: string;
  coupon_id: string;
  used_at: string;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  max_uses_per_user: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  // Computed
  userUses?: CouponUse[];
  hasRedeemed?: boolean;
}

const formatExpiryDate = (date: string | null) => {
  if (!date) return "No expiry";
  const expiry = new Date(date);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMs < 0) return "Expired";
  if (diffDays === 0) return "Expires today";
  if (diffDays === 1) return "Expires tomorrow";
  if (diffDays < 7) return `Expires in ${diffDays} days`;
  return `Expires ${expiry.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

function getRewardIcon(type: string) {
  switch (type) {
    case 'COINS_REWARD':
    case 'FIXED_COINS':
      return <Coins size={24} className="text-amber-400" />;
    case 'XP_REWARD':
      return <Star size={24} className="text-emerald-400" />;
    case 'TOKENS_REWARD':
    case 'FIXED_TOKENS':
      return <Gift size={24} className="text-violet-400" />;
    default:
      return <Sparkles size={24} className="text-brand-400" />;
  }
}

function getRewardLabel(type: string, value: number) {
  switch (type) {
    case 'COINS_REWARD':
    case 'FIXED_COINS':
      return `+${value.toLocaleString()} Coins`;
    case 'XP_REWARD':
      return `+${value.toLocaleString()} XP`;
    case 'TOKENS_REWARD':
    case 'FIXED_TOKENS':
      return `+${value.toLocaleString()} Tokens`;
    case 'PERCENTAGE':
      return `${value}% OFF`;
    default:
      return `+${value.toLocaleString()}`;
  }
}

function getGradient(type: string) {
  switch (type) {
    case 'COINS_REWARD':
    case 'FIXED_COINS':
      return 'from-amber-600 to-orange-600';
    case 'XP_REWARD':
      return 'from-emerald-600 to-teal-600';
    case 'TOKENS_REWARD':
    case 'FIXED_TOKENS':
      return 'from-violet-600 to-purple-600';
    default:
      return 'from-brand-600 to-blue-600';
  }
}

function getBorderColor(type: string) {
  switch (type) {
    case 'COINS_REWARD':
    case 'FIXED_COINS':
      return 'border-amber-500/30';
    case 'XP_REWARD':
      return 'border-emerald-500/30';
    case 'TOKENS_REWARD':
    case 'FIXED_TOKENS':
      return 'border-violet-500/30';
    default:
      return 'border-brand-500/30';
  }
}

export default function CouponsPage() {
  const router = useRouter();
  const { user, refreshUser, isAuthenticated } = useAuth();
  const { fetchNotifications } = useNotifications();
  const { t } = useTranslation();
  const [codeInput, setCodeInput] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<Array<{
    code: string;
    coins: number;
    xp: number;
    tokens: number;
    date: string;
  }>>([]);

  // Load recent redemptions from localStorage
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`redemptions_${user.id}`);
      if (stored) {
        setRecentRedemptions(JSON.parse(stored));
      }
    }
  }, [user?.id]);

  const handleRedeem = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!codeInput.trim() || !user?.id) return;

    setIsRedeeming(true);
    setRedeemResult(null);

    try {
      const response = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeInput.trim().toUpperCase(),
          account_id: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRedeemResult({ success: true, message: data.message });
        
        // Fire confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#34d399'],
          zIndex: 9999,
        });

        // Save to recent redemptions
        const newRedemption = {
          code: codeInput.trim().toUpperCase(),
          coins: data.rewards?.coins || 0,
          xp: data.rewards?.xp || 0,
          tokens: data.rewards?.tokens || 0,
          date: new Date().toISOString(),
        };
        const updated = [newRedemption, ...recentRedemptions.slice(0, 9)];
        setRecentRedemptions(updated);
        localStorage.setItem(`redemptions_${user.id}`, JSON.stringify(updated));

        // Clear input
        setCodeInput("");

        // Refresh user data to update balances
        await refreshUser();
        
        // Refresh notifications
        await fetchNotifications();
      } else {
        setRedeemResult({ success: false, message: data.error || 'Failed to redeem code' });
      }
    } catch (error) {
      console.error('Error redeeming code:', error);
      setRedeemResult({ success: false, message: 'Something went wrong. Please try again.' });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 sm:gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1 sm:gap-2"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.coupons.title}</h1>
        <p className="text-sm sm:text-base text-white/60">{t.coupons.pageSubtitle}</p>
      </motion.div>

      {/* Enter Coupon Code - Main Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/20 via-violet-600/10 to-emerald-600/20 p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20">
            <Ticket size={24} className="text-brand-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">{t.coupons.redeemCode}</h3>
            <p className="text-sm text-white/50">{t.coupons.enterCode}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            placeholder={t.coupons.codePlaceholder}
            className="flex-1 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 uppercase tracking-widest font-mono"
            disabled={isRedeeming}
          />
          {!isAuthenticated ? (
            <button 
              onClick={() => router.push('/auth/login')}
              className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {t.coupons.signInToRedeem}
            </button>
          ) : (
            <button 
              onClick={handleRedeem}
              disabled={isRedeeming || !codeInput.trim()}
              className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRedeeming ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t.coupons.redeeming}
                </>
              ) : (
                t.coupons.redeemButton
              )}
            </button>
          )}
        </div>

        {/* Result Message */}
        <AnimatePresence>
          {redeemResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm",
                redeemResult.success
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"
              )}
            >
              {redeemResult.success ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {redeemResult.message}
            </motion.div>
          )}
        </AnimatePresence>

        {!user && (
          <p className="mt-4 text-sm text-white/50 text-center">
            {t.coupons.pleaseLogin}
          </p>
        )}
      </motion.div>

      {/* Recent Redemptions */}
      {recentRedemptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white mb-3">{t.coupons.recentRedemptions}</h2>
          <div className="space-y-2">
            {recentRedemptions.map((redemption, index) => (
              <motion.div
                key={`${redemption.code}-${redemption.date}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                    <CheckCircle size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-white">{redemption.code}</p>
                    <p className="text-xs text-white/50">
                      {new Date(redemption.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {redemption.coins > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
                      <Coins size={14} />
                      +{redemption.coins.toLocaleString()}
                    </span>
                  )}
                  {redemption.xp > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                      <Star size={14} />
                      +{redemption.xp.toLocaleString()}
                    </span>
                  )}
                  {redemption.tokens > 0 && (
                    <span className="flex items-center gap-1 text-violet-400 text-sm font-semibold">
                      <Gift size={14} />
                      +{redemption.tokens.toLocaleString()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/5 bg-slate-950/40 p-6"
      >
        <h3 className="text-base font-semibold text-white mb-3">{t.coupons.howToGet}</h3>
        <ul className="space-y-2 text-sm text-white/60">
          <li className="flex items-start gap-2">
            <Sparkles size={16} className="text-brand-400 mt-0.5 shrink-0" />
            {t.coupons.followSocial}
          </li>
          <li className="flex items-start gap-2">
            <Sparkles size={16} className="text-brand-400 mt-0.5 shrink-0" />
            {t.coupons.participateEvents}
          </li>
        </ul>
      </motion.div>
    </section>
  );
}
