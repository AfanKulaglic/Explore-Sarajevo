'use client';

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Minus, Plus, ShoppingBag, Clock, Shield, Star, Check, Truck, Loader2, AlertCircle, LogIn } from "lucide-react";
import { Reward } from "@/lib/types";
import { cn, formatCurrency, getTagTone } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80";

interface RewardModalProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RewardModal({ reward, isOpen, onClose }: RewardModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user, isAuthenticated, refreshUser } = useAuth();

  if (!reward) return null;

  const totalPrice = reward.price * quantity;
  const maxQuantity = reward.stock || 10;
  const userBalance = reward.currency === "COINS" ? (user?.coins || 0) : (user?.tokens || 0);
  const canAfford = userBalance >= totalPrice;

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleRedeem = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    setIsRedeeming(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: user.id,
          account_email: user.email,
          reward_id: reward.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setSuccess(true);
      // Refresh user balance
      await refreshUser();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setQuantity(1);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to redeem reward');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setQuantity(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-3 sm:inset-x-auto sm:left-1/2 top-[5%] sm:top-1/2 z-50 w-auto sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl"
          >
            <div className="relative overflow-hidden border border-white/10 bg-slate-900 shadow-2xl rounded-2xl sm:rounded-3xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/50 text-white/60 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="relative w-full shrink-0 md:w-[280px]">
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={reward.imageUrl || DEFAULT_IMAGE}
                      alt={reward.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-900" />
                  </div>
                  
                  {/* Tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {reward.tags?.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm",
                          getTagTone(tag)
                        )}
                      >
                        {tag === "LIMITED_TIME" ? "⏳" : tag === "REQUIRES_APPROVAL" ? "🛡" : "⭐"}
                        {tag.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex w-full flex-col p-6 md:flex-1">
                  {/* Header */}
                  <div>
                    <p className="text-sm font-medium text-brand-400">{reward.subtitle}</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">{reward.title}</h2>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm leading-relaxed text-white/60">
                    {reward.description || "Redeem this exclusive reward with your earned coins. Limited quantities available - don't miss out on this amazing offer!"}
                  </p>

                  {/* Features */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">
                      <Truck size={14} className="text-emerald-400" />
                      <span>Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">
                      <Shield size={14} className="text-blue-400" />
                      <span>Verified Item</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">
                      <Clock size={14} className="text-amber-400" />
                      <span>Ships in 2-3 days</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">
                      <Star size={14} className="text-violet-400" />
                      <span>Premium Quality</span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-medium text-white/60">Quantity</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
                        <button
                          onClick={handleDecrement}
                          disabled={quantity <= 1}
                          className="flex h-10 w-10 items-center justify-center text-white/60 transition hover:text-white disabled:opacity-30"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-semibold text-white">{quantity}</span>
                        <button
                          onClick={handleIncrement}
                          disabled={quantity >= maxQuantity}
                          className="flex h-10 w-10 items-center justify-center text-white/60 transition hover:text-white disabled:opacity-30"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {reward.stock && (
                        <span className="text-xs text-white/40">{reward.stock} available</span>
                      )}
                    </div>
                  </div>

                  {/* Price & Redeem */}
                  <div className="mt-6 flex-1" />
                  <div className="space-y-3">
                    {/* Error Message */}
                    {error && (
                      <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}

                    {/* Success Message */}
                    {success && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
                        <Check size={16} />
                        Order placed successfully! Redirecting...
                      </div>
                    )}

                    {/* Total Price */}
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500">
                          <Coins size={18} className="text-white" />
                        </span>
                        <div>
                          <p className="text-xs text-white/50">Total Price</p>
                          <p className="text-xl font-bold text-white">
                            {formatCurrency(totalPrice, reward.currency, false)}
                            <span className="ml-1 text-sm font-normal text-white/50">
                              {reward.currency === "COINS" ? "coins" : "tokens"}
                            </span>
                          </p>
                        </div>
                      </div>
                      {isAuthenticated && (
                        <div className="text-right">
                          <p className="text-xs text-white/40">Your balance</p>
                          <p className={cn(
                            "text-sm font-semibold",
                            canAfford ? "text-emerald-400" : "text-red-400"
                          )}>
                            {userBalance.toLocaleString()} {reward.currency === "COINS" ? "coins" : "tokens"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Redeem Button or Login Prompt */}
                    {!isAuthenticated ? (
                      <Link
                        href="/auth/login"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 font-semibold text-white shadow-lg transition-all hover:from-brand-500 hover:to-brand-400 hover:shadow-xl"
                      >
                        <LogIn size={18} />
                        Sign in to Redeem
                      </Link>
                    ) : (
                      <button
                        onClick={handleRedeem}
                        disabled={isRedeeming || !canAfford || success}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white shadow-lg transition-all",
                          canAfford && !success
                            ? "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 hover:shadow-xl"
                            : "bg-slate-700 cursor-not-allowed opacity-60"
                        )}
                      >
                        {isRedeeming ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : success ? (
                          <>
                            <Check size={18} />
                            Order Placed!
                          </>
                        ) : !canAfford ? (
                          <>
                            <AlertCircle size={18} />
                            Insufficient {reward.currency === "COINS" ? "Coins" : "Tokens"}
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            Redeem Now
                          </>
                        )}
                      </button>
                    )}

                    {reward.requiresApproval && (
                      <p className="flex items-center justify-center gap-1.5 text-xs text-amber-400/80">
                        <Shield size={12} />
                        This reward requires approval after redemption
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
