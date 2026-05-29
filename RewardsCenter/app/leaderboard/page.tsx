'use client'

import { useEffect, useState } from 'react'
import { LeaderboardPanel } from "@/components/leaderboard/LeaderboardPanel";
import { ActivityFeed } from "@/components/leaderboard/ActivityFeed";
import { LeaderboardEntry, ActivityFeedItem } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [activityItems, setActivityItems] = useState<ActivityFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Fetch leaderboard and activity feed in parallel
        const [leaderboardResponse, activityResponse] = await Promise.all([
          fetch('/api/leaderboard?sortBy=xp&limit=100'),
          fetch('/api/activity-feed?limit=10')
        ])
        
        if (!leaderboardResponse.ok) {
          throw new Error('Failed to fetch leaderboard')
        }
        
        const leaderboardData = await leaderboardResponse.json()
        setEntries(leaderboardData.data || [])
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setActivityItems(activityData.data || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load leaderboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
      <LeaderboardPanel entries={entries} />
      <ActivityFeed items={activityItems} />
    </section>
  );
}
