'use client';

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";

const createTimeParts = (ms: number) => {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

export function Countdown({ target }: { target: string }) {
  const { t } = useTranslation();
  const targetTime = useMemo(() => new Date(target).getTime(), [target]);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    // Set initial time on client mount to avoid hydration mismatch
    setTimeLeft(createTimeParts(targetTime - Date.now()));
    
    const interval = window.setInterval(() => {
      setTimeLeft(createTimeParts(targetTime - Date.now()));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetTime]);

  const entries = [
    { label: t.common.days, value: timeLeft?.days ?? 0 },
    { label: t.common.hours, value: timeLeft?.hours ?? 0 },
    { label: t.common.minutes, value: timeLeft?.minutes ?? 0 },
    { label: t.common.seconds, value: timeLeft?.seconds ?? 0 },
  ];

  return (
    <div className="flex gap-1 sm:gap-3 rounded-xl sm:rounded-3xl bg-slate-950/60 p-1.5 sm:p-3 shadow-[0_15px_35px_rgba(5,10,30,0.55)] backdrop-blur-xl">
      {entries.map(({ label, value }) => (
        <div
          key={label}
          className="flex min-w-[40px] sm:min-w-[70px] flex-col items-center rounded-lg sm:rounded-2xl bg-slate-900/80 px-1.5 sm:px-4 py-1.5 sm:py-3 text-center shadow-inner"
        >
          <span className="text-base sm:text-2xl font-semibold text-white tabular-nums">
            {timeLeft ? value.toString().padStart(2, "0") : "--"}
          </span>
          <span className="text-[8px] sm:text-[11px] uppercase tracking-wide sm:tracking-[0.25em] text-white/85">{label}</span>
        </div>
      ))}
    </div>
  );
}
