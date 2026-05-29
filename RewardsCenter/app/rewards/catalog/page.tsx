'use client'

import { useEffect, useState, useMemo } from 'react'
import { AnnouncementBanner } from "@/components/catalog/AnnouncementBanner";
import { CatalogHeader, SortOption } from "@/components/catalog/CatalogHeader";
import { FiltersPanel, FilterState } from "@/components/catalog/FiltersPanel";
import { HeroRewardCard } from "@/components/catalog/HeroRewardCard";
import { RewardsGrid } from "@/components/catalog/RewardsGrid";
import { fetchRewards } from "@/lib/api";
import { Reward } from "@/lib/types";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const defaultFilters: FilterState = {
  type: 'all',
  category: 'all',
  currency: 'all',
  maxPrice: 50000000,
};

const defaultQuickFilters = { type: 'all', category: 'all', currency: 'all' };

export default function CatalogPage() {
  const { t } = useTranslation();
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters)
  
  // Header controls
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [quickFilters, setQuickFilters] = useState(defaultQuickFilters)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    async function loadRewards() {
      try {
        setIsLoading(true)
        const data = await fetchRewards()
        setRewards(data)
      } catch (err) {
        console.error('Failed to load rewards:', err)
        setError('Failed to load rewards. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadRewards()
  }, [])

  // Apply filters, search, and sort to rewards
  const filteredRewards = useMemo(() => {
    let result = rewards.filter(reward => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          reward.title.toLowerCase().includes(searchLower) ||
          reward.subtitle?.toLowerCase().includes(searchLower) ||
          reward.description?.toLowerCase().includes(searchLower) ||
          reward.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Quick filters (from header)
      if (quickFilters.type !== 'all' && reward.type !== quickFilters.type) {
        return false;
      }
      if (quickFilters.category !== 'all' && reward.category !== quickFilters.category) {
        return false;
      }
      if (quickFilters.currency !== 'all' && reward.currency !== quickFilters.currency) {
        return false;
      }
      
      // Panel filters
      if (appliedFilters.type !== 'all' && reward.type !== appliedFilters.type) {
        return false;
      }
      if (appliedFilters.category !== 'all' && reward.category !== appliedFilters.category) {
        return false;
      }
      if (appliedFilters.currency !== 'all' && reward.currency !== appliedFilters.currency) {
        return false;
      }
      if (reward.price > appliedFilters.maxPrice) {
        return false;
      }
      return true;
    });
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.expiresAt || 0).getTime() - new Date(a.expiresAt || 0).getTime();
        case 'oldest':
          return new Date(a.expiresAt || 0).getTime() - new Date(b.expiresAt || 0).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-az':
          return a.title.localeCompare(b.title);
        case 'name-za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    return result;
  }, [rewards, search, sortBy, quickFilters, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowMobileFilters(false);
  };

  // Featured reward is always shown regardless of filters (only 1)
  const featuredReward = rewards.find(r => r.tags?.includes('FEATURED'))
  
  // Grid rewards are already filtered (featured excluded in filteredRewards)
  const gridRewards = filteredRewards

  return (
    <section className="flex flex-col gap-4 sm:gap-6">
      <CatalogHeader 
        rewards={filteredRewards}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        quickFilters={quickFilters}
        onQuickFilterChange={setQuickFilters}
        onOpenMobileFilters={() => setShowMobileFilters(true)}
      />
      
      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-slate-900 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-white/60 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <FiltersPanel 
              filters={filters} 
              onFilterChange={setFilters} 
              onApply={handleApplyFilters}
              isMobile
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
        <FiltersPanel 
          filters={filters} 
          onFilterChange={setFilters} 
          onApply={handleApplyFilters} 
        />
        <div className="flex-1 space-y-4 sm:space-y-6">
          <AnnouncementBanner />
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Featured Product - Always visible */}
              {featuredReward && <HeroRewardCard reward={featuredReward} />}
              
              {/* Filtered Rewards Grid */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">{t.catalog.allRewards}</h3>
                {gridRewards.length > 0 ? (
                  <RewardsGrid rewards={gridRewards} />
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-white/60">{t.catalog.noRewardsMatch}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
