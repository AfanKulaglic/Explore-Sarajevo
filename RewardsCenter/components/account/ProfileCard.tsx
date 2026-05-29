'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Mail, Edit3, Settings } from "lucide-react";
import { AccountProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import EditProfileModal from "./EditProfileModal";

interface ProfileCardProps {
  profile: AccountProfile;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case "DIAMOND":
      return "from-cyan-400 to-blue-500";
    case "PLATINUM":
      return "from-teal-300 to-emerald-400";
    case "GOLD":
      return "from-amber-400 to-yellow-500";
    case "SILVER":
      return "from-slate-300 to-slate-400";
    case "BRONZE":
      return "from-orange-600 to-amber-700";
    default:
      return "from-slate-400 to-slate-500";
  }
};

const getTierBgColor = (tier: string) => {
  switch (tier) {
    case "DIAMOND":
      return "bg-cyan-500/10 border-cyan-400/30";
    case "PLATINUM":
      return "bg-teal-400/10 border-teal-400/30";
    case "GOLD":
      return "bg-amber-500/10 border-amber-400/30";
    case "SILVER":
      return "bg-slate-400/10 border-slate-300/30";
    case "BRONZE":
      return "bg-orange-500/10 border-orange-400/30";
    default:
      return "bg-slate-500/10 border-slate-400/30";
  }
};

export function ProfileCard({ profile }: ProfileCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const joinedDate = new Date(profile.joinedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-8 backdrop-blur-2xl"
    >
      {/* Background gradient accent */}
      <div className={cn(
        "absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
        getTierColor(profile.tier)
      )} />

      <div className="relative flex flex-col gap-4 sm:gap-8">
        {/* Avatar and basic info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="relative">
            <div className={cn(
              "absolute -inset-1 sm:-inset-1.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br opacity-60",
              getTierColor(profile.tier)
            )} />
            {profile.avatarUrl?.startsWith('data:') ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-xl sm:rounded-2xl object-cover"
              />
            ) : (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={120}
                height={120}
                className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-xl sm:rounded-2xl object-cover"
              />
            )}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-brand-600 text-white shadow-lg transition hover:bg-brand-500"
            >
              <Edit3 size={12} className="sm:hidden" />
              <Edit3 size={16} className="hidden sm:block" />
            </button>
          </div>

          <div className="flex-1 pt-0 sm:pt-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{profile.name}</h2>
              <span className={cn(
                "inline-flex items-center gap-1 sm:gap-1.5 rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider",
                getTierBgColor(profile.tier)
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gradient-to-br",
                  getTierColor(profile.tier)
                )} />
                {profile.tier}
              </span>
            </div>
            <p className="mt-1 text-sm sm:text-base text-white/60">{profile.handle}</p>
            
            <div className="mt-3 sm:mt-5 flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-white/50">
              <span className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <Mail size={12} className="sm:hidden" />
                <Mail size={14} className="hidden sm:block" />
                {profile.email}
              </span>
              <span className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <Calendar size={12} className="sm:hidden" />
                <Calendar size={14} className="hidden sm:block" />
                Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
          <Link 
            href="/account/settings"
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition hover:border-brand-500/40 hover:bg-brand-500/10"
          >
            <Settings size={14} className="sm:hidden" />
            <Settings size={16} className="hidden sm:block" />
            Settings
          </Link>
        </div>
      </div>
    </motion.div>

    <EditProfileModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      profile={profile}
    />
    </>
  );
}
