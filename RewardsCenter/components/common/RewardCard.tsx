'use client';

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { Reward } from "@/lib/types";
import { cn, formatCurrency, getTagTone } from "@/lib/utils";
import { RewardModal } from "./RewardModal";
import { useTranslation } from "@/lib/i18n";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80";

interface RewardCardProps {
  reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <motion.article
        whileHover={{ y: -6, scale: 1.01 }}
        onClick={() => setIsModalOpen(true)}
        className="flex h-full cursor-pointer flex-col gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-white/5 bg-white/5 p-2 sm:p-3 shadow-[0_15px_45px_rgba(2,6,23,0.45)] transition-colors hover:border-brand-500/30"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl">
          <Image
            src={reward.imageUrl || DEFAULT_IMAGE}
            alt={reward.title}
            fill
            className="rounded-xl sm:rounded-2xl object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/70" />
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-2">
            {reward.tags?.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "inline-flex items-center gap-0.5 sm:gap-1 rounded-full border px-1.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold",
                  getTagTone(tag)
                )}
              >
                {tag === "LIMITED_TIME" ? "⏳" : tag === "REQUIRES_APPROVAL" ? "🛡" : "⭐"}
                <span className="hidden sm:inline">{tag.replace("_", " ")}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 sm:gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-sm text-white/60 truncate">{reward.subtitle}</p>
            <h3 className="text-sm sm:text-lg font-semibold text-white line-clamp-2">{reward.title}</h3>
          </div>
          <div className="mt-auto flex items-center rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-white">
              <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-2xl bg-gradient-to-br from-amber-400/80 to-amber-500/80">
                <Coins size={12} className="sm:hidden" />
                <Coins size={16} className="hidden sm:block" />
              </span>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-xs uppercase text-white/60">{t.catalog.price}</p>
                <p className="text-xs sm:text-base font-semibold text-white">
                  {formatCurrency(reward.price, reward.currency, false)}
                  <span className="ml-0.5 sm:ml-1 text-[8px] sm:text-xs uppercase text-white/60">
                    {reward.currency === "COINS" ? t.common.coins.toLowerCase() : "tok"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.article>

      <RewardModal
        reward={reward}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
