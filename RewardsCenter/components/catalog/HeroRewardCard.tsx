'use client'

import { useState } from "react";
import Image from "next/image";
import { Reward } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { RewardModal } from "@/components/common/RewardModal";
import { useTranslation } from "@/lib/i18n";

interface HeroRewardCardProps {
  reward: Reward;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80";

export function HeroRewardCard({ reward }: HeroRewardCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-r from-sky-600/60 via-blue-600/60 to-indigo-600/60 p-4 sm:p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.6)] cursor-pointer transition-transform hover:scale-[1.01]">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/70">{t.catalog.featuredDrop}</p>
            <h3 className="text-xl sm:text-3xl font-semibold leading-tight">{reward.title}</h3>
            <p className="text-sm sm:text-base text-white/80">{reward.subtitle}</p>
            <div className="flex items-center gap-2 sm:gap-3">
              {[0, 1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className={cn(
                    "h-1.5 sm:h-2 w-6 sm:w-8 rounded-full bg-white/30",
                    dot === 0 && "bg-white"
                  )}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 sm:py-3 text-center">
                <p className="text-xs uppercase text-white/60">{t.catalog.cost}</p>
                <p className="text-lg sm:text-xl font-semibold">
                  {formatCurrency(reward.price, reward.currency, false)}
                  <span className="ml-1 text-xs sm:text-sm uppercase text-white/70">
                    {reward.currency === "COINS" ? t.common.coins.toLowerCase() : "tok"}
                  </span>
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                className="rounded-full bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-indigo-700 transition hover:bg-slate-100"
              >
                <span className="sm:hidden">{t.catalog.redeem}</span>
                <span className="hidden sm:inline">{t.catalog.redeemFor} {formatCurrency(reward.price)}</span>
              </button>
            </div>
          </div>
          <div className="relative min-h-[200px] sm:min-h-[280px]">
            <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-950/30">
              <Image
                src={reward.imageUrl || DEFAULT_IMAGE}
                alt={reward.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>
      
      <RewardModal
        reward={reward}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
