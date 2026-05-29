'use client';

import * as React from 'react';
import { Search, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  showDateFilter?: boolean;
  className?: string;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  showDateFilter = false,
  className
}: SearchFilterProps) {
  const hasFilters = searchValue || dateFrom || dateTo;

  const handleClear = () => {
    onSearchChange('');
    onDateFromChange?.('');
    onDateToChange?.('');
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            'w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-sm',
            'placeholder-slate-400 text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            'hover:border-slate-300 transition-colors'
          )}
        />
      </div>

      {/* Date Range Filter */}
      {showDateFilter && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 hidden sm:inline">From:</span>
          </div>
          <input
            type="date"
            value={dateFrom || ''}
            onChange={(e) => onDateFromChange?.(e.target.value)}
            className={cn(
              'h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              'hover:border-slate-300 transition-colors'
            )}
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="date"
            value={dateTo || ''}
            onChange={(e) => onDateToChange?.(e.target.value)}
            className={cn(
              'h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              'hover:border-slate-300 transition-colors'
            )}
          />
        </div>
      )}

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 h-9 px-3 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
