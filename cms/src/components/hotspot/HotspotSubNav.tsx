'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

/**
 * Hotspot section toolbar: refresh only. Primary navigation lives in the dashboard sidebar.
 */
interface HotspotSubNavProps {
  onRefresh: () => void | Promise<void>;
  refreshing?: boolean;
}

export function HotspotSubNav({ onRefresh, refreshing }: HotspotSubNavProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-wrap justify-end gap-2 pb-4 border-b border-gray-200">
      <button
        type="button"
        onClick={() => void onRefresh()}
        disabled={refreshing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        {language === 'bs' ? 'Osvježi podatke' : 'Refresh data'}
      </button>
    </div>
  );
}
