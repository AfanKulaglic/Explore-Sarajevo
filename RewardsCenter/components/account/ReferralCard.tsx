'use client';

import { motion, AnimatePresence } from "framer-motion";
import { Users, Gift, Copy, Share2, Check, Loader2, X, Ticket, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";

interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  successfulReferrals: number;
  totalEarned: number;
  rewardsClaimedThisMonth: number;
  maxRewardsPerMonth: number;
  rewardAmount: number;
  hasUsedReferral: boolean;
  referredBy: string | null;
}

export function ReferralCard() {
  const { user, updateBalance } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [showEnterCode, setShowEnterCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchReferralStats = async () => {
      try {
        const response = await fetch(`/api/referrals?account_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching referral stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralStats();
  }, [user?.id]);

  const referralCode = stats?.referralCode || 'LOADING';
  const referralLink = `https://rewards.saraya.solutions/ref/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Saraya Rewards!',
          text: `Use my referral code ${referralCode} to get ${stats?.rewardAmount?.toLocaleString() || '3,000'} bonus coins!`,
          url: referralLink
        });
      } catch (error) {
        // User cancelled or share failed, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleSubmitCode = async () => {
    if (!user?.id || !codeInput.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: user.id,
          referral_code: codeInput.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setStats(prev => prev ? { ...prev, hasUsedReferral: true } : prev);
        setCodeInput('');
        // Update balance if coins were awarded
        if (data.coinsEarned && user) {
          updateBalance(user.coins + data.coinsEarned);
        }
        // Hide the modal after success
        setTimeout(() => {
          setShowEnterCode(false);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to apply referral code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
    return num.toString();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
      >
        {/* Background decoration */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <Users size={14} className="text-white sm:hidden" />
                <Users size={18} className="text-white hidden sm:block" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">{t.account.inviteFriends}</h3>
                <p className="text-[10px] sm:text-xs text-white/50">{t.account.earnRewardsForReferral}</p>
              </div>
            </div>
            
            {/* Enter code button - only show if user hasn't used one */}
            {!stats?.hasUsedReferral && !isLoading && (
              <button
                onClick={() => setShowEnterCode(true)}
                className="flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-brand-400 transition hover:bg-brand-500/20"
              >
                <Ticket size={12} />
                <span className="hidden sm:inline">{t.account.enterCode}</span>
                <span className="sm:hidden">{t.account.enterCode}</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-white/40" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                <div className="rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-2 sm:p-3 text-center">
                  <p className="text-lg sm:text-xl font-bold text-emerald-400">{stats?.successfulReferrals || 0}</p>
                  <p className="text-[10px] sm:text-xs text-white/50">{t.account.joined}</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl border border-amber-500/20 bg-amber-500/10 p-2 sm:p-3 text-center">
                  <p className="text-lg sm:text-xl font-bold text-amber-400">
                    {formatNumber(stats?.totalEarned || 0)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/50">{t.account.earned}</p>
                </div>
              </div>

              {/* Reward info */}
              <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 sm:p-4 mb-4 sm:mb-5">
                <Gift size={16} className="text-brand-400 shrink-0 sm:hidden" />
                <Gift size={20} className="text-brand-400 shrink-0 hidden sm:block" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-white/80">
                    {t.account.earnCoinsPerFriend.replace('{coins}', (stats?.rewardAmount || 3000).toLocaleString())}
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">
                    {t.account.rewardsClaimedThisMonth
                      .replace('{claimed}', String(stats?.rewardsClaimedThisMonth || 0))
                      .replace('{max}', String(stats?.maxRewardsPerMonth || 10))}
                  </p>
                </div>
              </div>

              {/* Referral Code */}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/40">{t.account.yourReferralCode}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3">
                    <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white">{referralCode}</span>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-brand-400 hover:text-brand-300 transition"
                    >
                      {copied ? <Check size={12} className="sm:hidden" /> : <Copy size={12} className="sm:hidden" />}
                      {copied ? <Check size={14} className="hidden sm:block" /> : <Copy size={14} className="hidden sm:block" />}
                      {copied ? t.account.copied : t.account.copy}
                    </button>
                  </div>
                  <button 
                    onClick={handleShare}
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400"
                  >
                    <Share2 size={16} className="sm:hidden" />
                    <Share2 size={18} className="hidden sm:block" />
                  </button>
                </div>
              </div>

              {/* Show if user has already used a referral code */}
              {stats?.hasUsedReferral && (
                <div className="mt-3 flex items-center gap-2 text-[10px] sm:text-xs text-white/40">
                  <Check size={12} className="text-emerald-400" />
                  <span>{t.account.alreadyUsedReferral}</span>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Enter Referral Code Modal */}
      <AnimatePresence>
        {showEnterCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowEnterCode(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{t.account.enterReferralCode}</h3>
                <button
                  onClick={() => setShowEnterCode(false)}
                  className="text-white/40 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-white/60 mb-4">
                {t.account.enterFriendCode.replace('{coins}', (stats?.rewardAmount || 3000).toLocaleString())}
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder={t.account.enterCodePlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-500/50 focus:outline-none font-mono uppercase"
                  maxLength={12}
                />

                {message && (
                  <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                    message.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEnterCode(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    onClick={handleSubmitCode}
                    disabled={!codeInput.trim() || isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-sm font-semibold text-white hover:from-brand-500 hover:to-brand-400 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      t.account.applyCode
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-4 text-[10px] text-white/30 text-center">
                {t.account.oneCodePerAccount}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
