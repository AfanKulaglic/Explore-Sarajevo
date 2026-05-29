'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Trophy, Zap, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type TournamentFilter = "ALL" | "LIVE" | "UPCOMING" | "COMPLETED";
type TournamentTypeFilter = "ALL" | "SOLO" | "TEAM" | "BRACKET";

interface TournamentFiltersProps {
  activeStatus: TournamentFilter;
  activeType: TournamentTypeFilter;
  onStatusChange: (status: TournamentFilter) => void;
  onTypeChange: (type: TournamentTypeFilter) => void;
}

const statusFilters: { value: TournamentFilter; label: string; icon: React.ReactNode }[] = [
  { value: "ALL", label: "All", icon: <Trophy size={14} /> },
  { value: "LIVE", label: "Live", icon: <Zap size={14} /> },
  { value: "UPCOMING", label: "Upcoming", icon: <Clock size={14} /> },
  { value: "COMPLETED", label: "Completed", icon: <CheckCircle size={14} /> },
];

const typeFilters: { value: TournamentTypeFilter; label: string; icon: string }[] = [
  { value: "ALL", label: "All Types", icon: "🎮" },
  { value: "SOLO", label: "Solo", icon: "👤" },
  { value: "TEAM", label: "Team", icon: "👥" },
  { value: "BRACKET", label: "Bracket", icon: "🏆" },
];

export function TournamentFilters({ 
  activeStatus, 
  activeType, 
  onStatusChange, 
  onTypeChange 
}: TournamentFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-5 backdrop-blur-2xl"
    >
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
        <input
          type="text"
          placeholder="Search tournaments..."
          className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
        />
      </div>
      
      {/* Status Filters */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onStatusChange(filter.value)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all",
              activeStatus === filter.value
                ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20"
                : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {filter.icon}
            <span className="hidden sm:inline">{filter.label}</span>
            <span className="sm:hidden">{filter.label === "Completed" ? "Done" : filter.label}</span>
            {filter.value === "LIVE" && activeStatus !== "LIVE" && (
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500" />
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Type Filters */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onTypeChange(filter.value)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all",
              activeType === filter.value
                ? "border border-brand-500/40 bg-brand-500/20 text-brand-400"
                : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span>{filter.icon}</span>
            <span className="hidden sm:inline">{filter.label}</span>
            <span className="sm:hidden">{filter.value === "ALL" ? "All" : filter.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
