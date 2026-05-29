'use client';

import Image from "next/image";
import { Countdown } from "@/components/common/Countdown";
import { mockRewards } from "@/lib/mock-data";
import { useTranslation } from "@/lib/i18n";

const comingSoon = mockRewards.find((reward) => reward.id === "apple-watch");

export function AnnouncementBanner() {
  const { t } = useTranslation();
  
  if (!comingSoon) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-violet-500/40 bg-gradient-to-r from-violet-600/80 via-indigo-600/70 to-purple-500/60 p-4 sm:p-6 text-white shadow-[0_20px_60px_rgba(88,28,135,0.45)]">
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-center lg:text-left">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/80">{t.common.comingSoon}</p>
          <h2 className="text-lg sm:text-2xl font-semibold">{t.catalog.comingToStore}</h2>
          <p className="text-sm sm:text-base text-white/80">{t.catalog.reserveSlot}</p>
        </div>
        <div className="shrink-0 flex justify-center lg:justify-end">
          {comingSoon.expiresAt && <Countdown target={comingSoon.expiresAt} />}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-4 right-4 hidden w-[260px] rounded-3xl bg-slate-950/20 backdrop-blur-sm lg:block">
        <Image
          src={comingSoon.imageUrl}
          alt={comingSoon.title}
          fill
          className="rounded-3xl object-cover opacity-90"
          sizes="280px"
          priority
        />
      </div>
    </div>
  );
}
