import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrencyCode, OrderStatus, RewardTag } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: CurrencyCode = "COINS",
  withSuffix = true
) {
  const formatted = value.toLocaleString("en-US");
  if (!withSuffix) return formatted;
  return currency === "COINS" ? `${formatted} coins` : `${formatted} tk`;
}

export function formatXP(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M XP`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K XP`;
  }
  return `${value.toLocaleString()} XP`;
}

export function calculateLevel(xp: number): number {
  // Each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 1000 XP, Level 3: 3000 XP, etc.
  return Math.floor(Math.sqrt(xp / 500)) + 1;
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 500;
}

export function xpToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
}

export function formatStatus(status: OrderStatus) {
  const labelMap: Record<OrderStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    FULFILLED: "Fulfilled",
    DENIED: "Denied",
  };

  return labelMap[status];
}

export function getStatusTone(status: OrderStatus) {
  const tones: Record<OrderStatus, string> = {
    PENDING: "text-amber-200 bg-amber-500/10 border-amber-400/20",
    APPROVED: "text-emerald-200 bg-emerald-500/10 border-emerald-400/20",
    FULFILLED: "text-sky-200 bg-sky-500/10 border-sky-400/20",
    DENIED: "text-rose-200 bg-rose-500/10 border-rose-400/20",
  };

  return tones[status];
}

export function getTagTone(tag: RewardTag) {
  switch (tag) {
    case "FEATURED":
      return "text-indigo-200 bg-indigo-500/10 border-indigo-400/20";
    case "LIMITED_TIME":
      return "text-amber-200 bg-amber-500/10 border-amber-400/20";
    case "REQUIRES_APPROVAL":
      return "text-rose-200 bg-rose-500/10 border-rose-400/20";
    default:
      return "text-slate-200 bg-slate-500/10 border-slate-400/20";
  }
}
