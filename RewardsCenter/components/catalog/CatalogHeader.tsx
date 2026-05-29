'use client'

import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X, Filter } from "lucide-react";
import { StatPill } from "@/components/common/StatPill";
import { productTypes, categories, currencies } from "@/lib/mock-data";
import { Reward } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

export type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-az' | 'name-za';

interface CatalogHeaderProps {
  rewards: Reward[];
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  quickFilters: { type: string; category: string; currency: string };
  onQuickFilterChange: (filters: { type: string; category: string; currency: string }) => void;
  onOpenMobileFilters?: () => void;
}

const sortOptions: { value: SortOption; label: string; shortLabel: string }[] = [
  { value: 'newest', label: 'Newest to Oldest', shortLabel: 'Newest' },
  { value: 'oldest', label: 'Oldest to Newest', shortLabel: 'Oldest' },
  { value: 'price-low', label: 'Price: Low to High', shortLabel: 'Price ↑' },
  { value: 'price-high', label: 'Price: High to Low', shortLabel: 'Price ↓' },
  { value: 'name-az', label: 'Name: A to Z', shortLabel: 'A-Z' },
  { value: 'name-za', label: 'Name: Z to A', shortLabel: 'Z-A' },
];

export function CatalogHeader({ 
  rewards, 
  search, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  quickFilters,
  onQuickFilterChange,
  onOpenMobileFilters 
}: CatalogHeaderProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const { t } = useTranslation();

  // Create translated sort options
  const translatedSortOptions = [
    { value: 'newest' as SortOption, label: t.catalog.sortNewest, shortLabel: t.catalog.sortNewest.split(' ')[0] },
    { value: 'oldest' as SortOption, label: t.catalog.sortOldest, shortLabel: t.catalog.sortOldest.split(' ')[0] },
    { value: 'price-low' as SortOption, label: t.catalog.sortPriceLow, shortLabel: t.catalog.price + ' ↑' },
    { value: 'price-high' as SortOption, label: t.catalog.sortPriceHigh, shortLabel: t.catalog.price + ' ↓' },
    { value: 'name-az' as SortOption, label: t.catalog.sortNameAZ, shortLabel: 'A-Z' },
    { value: 'name-za' as SortOption, label: t.catalog.sortNameZA, shortLabel: 'Z-A' },
  ];

  const currentSort = translatedSortOptions.find(s => s.value === sortBy) || translatedSortOptions[0];
  const avgCost = rewards.length > 0 
    ? Math.round(rewards.reduce((sum, r) => sum + r.price, 0) / rewards.length / 1000) 
    : 0;

  const hasActiveQuickFilters = quickFilters.type !== 'all' || quickFilters.category !== 'all' || quickFilters.currency !== 'all';

  return (
    <div className="flex flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-white/5 bg-white/5 p-3 sm:p-5">
      {/* Desktop: Single row with all items */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Search bar - 30% width */}
        <div className="relative w-[30%]">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder={t.catalog.searchRewards}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
          />
          {search && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Stat pills and sort - fill remaining 70% */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1">
            <StatPill
              label={t.catalog.rewards}
              value={rewards.length.toString()}
              tone="bg-white/5 border-white/5"
            />
          </div>
          <div className="flex-1">
            <StatPill label={t.catalog.avgCost} value={`${avgCost}k coins`} tone="bg-white/5 border-white/5" />
          </div>
          <div className="relative flex-1">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-brand-500/40 hover:bg-brand-500/10"
            >
              <SlidersHorizontal size={16} />
              <span>{currentSort.label}</span>
              <ChevronDown size={14} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-2 z-50 min-w-[200px] rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl">
                {translatedSortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { onSortChange(option.value); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition ${sortBy === option.value ? 'bg-brand-500/20 text-brand-400' : 'text-white/80 hover:bg-white/5'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Original layout */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder={t.catalog.searchRewards}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 py-2.5 sm:py-3 pl-9 sm:pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
            />
            {search && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Sort dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white/80 transition hover:border-brand-500/40 hover:bg-brand-500/10"
              >
                <SlidersHorizontal size={16} />
                <span>{currentSort.shortLabel}</span>
                <ChevronDown size={14} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              {showSortMenu && (
                <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 z-50 min-w-[180px] rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl">
                  {translatedSortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { onSortChange(option.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${sortBy === option.value ? 'bg-brand-500/20 text-brand-400' : 'text-white/80 hover:bg-white/5'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick filters toggle - mobile only */}
            <button 
              onClick={() => setShowQuickFilters(!showQuickFilters)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition ${hasActiveQuickFilters ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-white/10 bg-white/5 text-white/80 hover:border-brand-500/40 hover:bg-brand-500/10'}`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">{t.catalog.quickFilters}</span>
              {hasActiveQuickFilters && <span className="w-2 h-2 rounded-full bg-brand-500" />}
            </button>
            
            {/* Mobile full filters button */}
            <button 
              onClick={onOpenMobileFilters}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white/80 transition hover:border-brand-500/40 hover:bg-brand-500/10"
            >
              <SlidersHorizontal size={16} />
              <span>{t.catalog.allFilters}</span>
            </button>
          </div>
        </div>
        
        {/* Quick filters row - mobile only */}
        {showQuickFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            <select
              value={quickFilters.type}
              onChange={(e) => onQuickFilterChange({ ...quickFilters, type: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {productTypes.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
              ))}
            </select>
            <select
              value={quickFilters.category}
              onChange={(e) => onQuickFilterChange({ ...quickFilters, category: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {categories.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
              ))}
            </select>
            <select
              value={quickFilters.currency}
              onChange={(e) => onQuickFilterChange({ ...quickFilters, currency: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {currencies.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
              ))}
            </select>
            {hasActiveQuickFilters && (
              <button
                onClick={() => onQuickFilterChange({ type: 'all', category: 'all', currency: 'all' })}
                className="px-3 py-2 text-sm text-red-400 hover:text-red-300 transition"
              >
                {t.catalog.clear}
              </button>
            )}
          </div>
        )}
        
        {/* Stat pills - mobile only */}
        <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
          <StatPill
            label={t.catalog.rewards}
            value={rewards.length.toString()}
            tone="bg-white/5 border-white/5"
          />
          <StatPill label={t.catalog.avgCost} value={`${avgCost}k coins`} tone="bg-white/5 border-white/5" />
        </div>
      </div>
    </div>
  );
}
