'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Calendar, Users, Loader2, Coins } from "lucide-react";
import { FeaturedTournament } from "@/components/tournaments/FeaturedTournament";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { TournamentLeaderboard } from "@/components/tournaments/TournamentLeaderboard";
import { fetchTournaments, getUserTournaments, UserTournamentStats } from "@/lib/api";
import { Tournament } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";

export default function TournamentsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [userStats, setUserStats] = useState<UserTournamentStats | null>(null)
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [tournamentsData, statsData] = await Promise.all([
        fetchTournaments(),
        user?.id ? getUserTournaments(user.id) : Promise.resolve(null)
      ])
      setTournaments(tournamentsData)
      
      if (statsData) {
        setUserStats(statsData)
        // Build set of joined tournament IDs
        const joinedIds = new Set(statsData.participations.map(p => p.tournamentId))
        setJoinedTournamentIds(joinedIds)
      }
    } catch (err) {
      console.error('Failed to load tournaments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])
  
  // Find a featured live tournament for the hero section
  const featuredTournament = tournaments.find(t => t.featured && t.status === "LIVE") || 
                             tournaments.find(t => t.status === "LIVE");
  
  // Get all tournaments except the featured one
  const otherTournaments = useMemo(() => {
    return tournaments.filter(tournament => tournament.id !== featuredTournament?.id);
  }, [featuredTournament?.id, tournaments]);
  
  // Get active tournament for leaderboard display
  const activeTournament = tournaments.find(t => t.status === "LIVE" && t.topParticipants?.length > 0);
  
  // Stats
  const liveTournaments = tournaments.filter(t => t.status === "LIVE").length;
  const upcomingTournaments = tournaments.filter(t => t.status === "UPCOMING").length;
  const totalPrizePool = tournaments
    .filter(t => t.status !== "COMPLETED")
    .reduce((sum, t) => sum + (t.prizes?.reduce((s, p) => s + (p.coins || 0), 0) || 0), 0);
  // Count how many tournaments the current user is competing in
  const userCompetingCount = joinedTournamentIds.size;

  return (
    <section className="flex flex-col gap-4 sm:gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.nav.tournaments}</h1>
        <p className="text-sm sm:text-base text-white/60">{t.tournaments.subtitle}</p>
      </motion.div>
      
      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4"
      >
        <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 sm:p-4">
          <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/20">
            <Flame size={16} className="text-emerald-400 sm:hidden" />
            <Flame size={18} className="text-emerald-400 hidden sm:block" />
          </span>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-white">{liveTournaments}</p>
            <p className="text-[10px] sm:text-xs text-white/50 truncate">{t.tournaments.liveNow}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-4">
          <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/20">
            <Calendar size={16} className="text-amber-400 sm:hidden" />
            <Calendar size={18} className="text-amber-400 hidden sm:block" />
          </span>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-white">{upcomingTournaments}</p>
            <p className="text-[10px] sm:text-xs text-white/50 truncate">{t.tournaments.upcoming}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 sm:p-4">
          <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-brand-500/20">
            <Trophy size={16} className="text-brand-400 sm:hidden" />
            <Trophy size={18} className="text-brand-400 hidden sm:block" />
          </span>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-white">{totalPrizePool.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-white/50 truncate">{t.tournaments.totalPrizes}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 sm:p-4">
          <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-violet-500/20">
            <Users size={16} className="text-violet-400 sm:hidden" />
            <Users size={18} className="text-violet-400 hidden sm:block" />
          </span>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-white">{userCompetingCount}</p>
            <p className="text-[10px] sm:text-xs text-white/50 truncate">{t.tournaments.youreIn}</p>
          </div>
        </div>
      </motion.div>
      
      {/* Featured Tournament */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          {featuredTournament && (
            <FeaturedTournament 
              tournament={featuredTournament} 
              isJoined={joinedTournamentIds.has(featuredTournament.id)}
              onJoinChange={loadData}
            />
          )}
      
      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Column - Tournament Grid */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {otherTournaments.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {otherTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <TournamentCard 
                    tournament={tournament} 
                    isJoined={joinedTournamentIds.has(tournament.id)}
                    onJoinChange={loadData}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 py-12 sm:py-16 backdrop-blur-2xl"
            >
              <Trophy size={40} className="text-white/20 mb-4 sm:hidden" />
              <Trophy size={48} className="text-white/20 mb-4 hidden sm:block" />
              <p className="text-sm sm:text-base text-white/60">{t.tournaments.noTournaments}</p>
              <p className="text-xs sm:text-sm text-white/40">{t.tournaments.adjustFilters}</p>
            </motion.div>
          )}
        </div>
        
        {/* Right Column - Leaderboard */}
        <div className="space-y-4 sm:space-y-6">
          {activeTournament && (
            <TournamentLeaderboard 
              participants={activeTournament.topParticipants}
              title={`${activeTournament.title} Leaders`}
            />
          )}
          
          {/* Your Tournaments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t.tournaments.yourTournaments}</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 sm:p-4">
                <div>
                  <p className="text-sm sm:text-base font-medium text-white">{t.tournaments.active}</p>
                  <p className="text-[10px] sm:text-xs text-white/50">{t.tournaments.currentlyParticipating}</p>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-brand-400">{userStats?.active || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-4">
                <div>
                  <p className="text-sm sm:text-base font-medium text-white">{t.tournaments.won}</p>
                  <p className="text-[10px] sm:text-xs text-white/50">{t.tournaments.totalVictories}</p>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-amber-400">{userStats?.won || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 sm:p-4">
                <div>
                  <p className="text-sm sm:text-base font-medium text-white">{t.tournaments.earnings}</p>
                  <p className="text-[10px] sm:text-xs text-white/50">{t.tournaments.fromTournaments}</p>
                </div>
                <span className="text-base sm:text-xl font-bold text-emerald-400 flex items-center gap-1">
                  <Coins size={16} className="hidden sm:inline" />
                  {(userStats?.totalEarnings || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
        </>
      )}
    </section>
  );
}
