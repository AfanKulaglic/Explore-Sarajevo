'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Wallet, Gift, Coins, Crown, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  price: number;
  popular?: boolean;
  bestValue?: boolean;
}

const coinPackages: CoinPackage[] = [
  { id: "starter", coins: 5000, bonus: 0, price: 4.99 },
  { id: "basic", coins: 12000, bonus: 500, price: 9.99 },
  { id: "popular", coins: 30000, bonus: 2000, price: 19.99, popular: true },
  { id: "premium", coins: 75000, bonus: 7500, price: 39.99 },
  { id: "ultimate", coins: 200000, bonus: 30000, price: 79.99, bestValue: true },
];

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
  { id: "wallet", name: "Digital Wallet", icon: Wallet },
  { id: "gift", name: "Gift Card", icon: Gift },
];

export function AddFundsModal({ isOpen, onClose }: AddFundsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>("popular");
  const [selectedPayment, setSelectedPayment] = useState<string>("card");
  const [step, setStep] = useState<1 | 2>(1);

  const selected = coinPackages.find(p => p.id === selectedPackage);

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      // Handle purchase
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
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
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-3 sm:inset-x-auto sm:left-1/2 top-[5%] sm:top-1/2 z-50 w-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 max-h-[90vh] overflow-y-auto"
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              {/* Header */}
              <div className="relative border-b border-white/10 bg-gradient-to-r from-brand-600/20 via-violet-600/20 to-brand-600/20 px-4 sm:px-6 py-4 sm:py-5">
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
                      <Coins size={20} className="text-white sm:hidden" />
                      <Coins size={24} className="text-white hidden sm:block" />
                    </span>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">Add Funds</h2>
                      <p className="text-xs sm:text-sm text-white/60">
                        {step === 1 ? "Select a coin package" : "Choose payment method"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
                  >
                    <X size={18} className="sm:hidden" />
                    <X size={20} className="hidden sm:block" />
                  </button>
                </div>

                {/* Step indicator */}
                <div className="relative mt-4 flex gap-2">
                  <div className={cn(
                    "h-1 flex-1 rounded-full transition-all",
                    step >= 1 ? "bg-brand-500" : "bg-white/20"
                  )} />
                  <div className={cn(
                    "h-1 flex-1 rounded-full transition-all",
                    step >= 2 ? "bg-brand-500" : "bg-white/20"
                  )} />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-2 sm:space-y-3"
                    >
                      {coinPackages.map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={cn(
                            "relative w-full rounded-xl sm:rounded-2xl border p-3 sm:p-4 text-left transition-all",
                            selectedPackage === pkg.id
                              ? "border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30"
                              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                          )}
                        >
                          {/* Badges */}
                          {pkg.popular && (
                            <span className="absolute -top-2 right-3 sm:right-4 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-bold text-white">
                              POPULAR
                            </span>
                          )}
                          {pkg.bestValue && (
                            <span className="absolute -top-2 right-3 sm:right-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-bold text-white">
                              BEST VALUE
                            </span>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className={cn(
                                "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl",
                                selectedPackage === pkg.id
                                  ? "bg-brand-500/20"
                                  : "bg-white/10"
                              )}>
                                <Crown size={16} className={cn(
                                  "sm:hidden",
                                  selectedPackage === pkg.id ? "text-brand-400" : "text-white/60"
                                )} />
                                <Crown size={20} className={cn(
                                  "hidden sm:block",
                                  selectedPackage === pkg.id ? "text-brand-400" : "text-white/60"
                                )} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <span className="text-base sm:text-lg font-bold text-white">
                                    {pkg.coins.toLocaleString()}
                                  </span>
                                  <span className="text-xs sm:text-sm text-white/50">coins</span>
                                </div>
                                {pkg.bonus > 0 && (
                                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400">
                                    <Zap size={10} className="sm:hidden" />
                                    <Zap size={12} className="hidden sm:block" />
                                    +{pkg.bonus.toLocaleString()} bonus
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg sm:text-xl font-bold text-white">${pkg.price}</p>
                              {selectedPackage === pkg.id && (
                                <Check size={14} className="ml-auto text-brand-400 sm:hidden" />
                              )}
                              {selectedPackage === pkg.id && (
                                <Check size={16} className="ml-auto text-brand-400 hidden sm:block" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* Selected package summary */}
                      {selected && (
                        <div className="rounded-xl sm:rounded-2xl border border-brand-500/30 bg-brand-500/10 p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs sm:text-sm text-white/60">You're purchasing</p>
                              <p className="text-lg sm:text-xl font-bold text-white">
                                {(selected.coins + selected.bonus).toLocaleString()} coins
                              </p>
                              {selected.bonus > 0 && (
                                <p className="text-[10px] sm:text-xs text-emerald-400">
                                  Includes {selected.bonus.toLocaleString()} bonus coins
                                </p>
                              )}
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-brand-400">${selected.price}</p>
                          </div>
                        </div>
                      )}

                      {/* Payment methods */}
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-medium text-white/60">Payment Method</p>
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          return (
                            <button
                              key={method.id}
                              onClick={() => setSelectedPayment(method.id)}
                              className={cn(
                                "flex w-full items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all",
                                selectedPayment === method.id
                                  ? "border-brand-500 bg-brand-500/10"
                                  : "border-white/10 bg-white/5 hover:border-white/20"
                              )}
                            >
                              <div className={cn(
                                "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl",
                                selectedPayment === method.id ? "bg-brand-500/20" : "bg-white/10"
                              )}>
                                <Icon size={16} className={cn(
                                  "sm:hidden",
                                  selectedPayment === method.id ? "text-brand-400" : "text-white/60"
                                )} />
                                <Icon size={18} className={cn(
                                  "hidden sm:block",
                                  selectedPayment === method.id ? "text-brand-400" : "text-white/60"
                                )} />
                              </div>
                              <span className="text-sm sm:text-base font-medium text-white">{method.name}</span>
                              {selectedPayment === method.id && (
                                <Check size={14} className="ml-auto text-brand-400 sm:hidden" />
                              )}
                              {selectedPayment === method.id && (
                                <Check size={16} className="ml-auto text-brand-400 hidden sm:block" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Card details (if card selected) */}
                      {selectedPayment === "card" && (
                        <div className="space-y-2 sm:space-y-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                          <input
                            type="text"
                            placeholder="Card number"
                            className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
                          />
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="CVC"
                              className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 bg-white/5 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
                  >
                    {step === 1 ? "Cancel" : "Back"}
                  </button>
                  <button
                    onClick={handleContinue}
                    className="flex-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400"
                  >
                    {step === 1 ? "Continue" : `Pay $${selected?.price}`}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
