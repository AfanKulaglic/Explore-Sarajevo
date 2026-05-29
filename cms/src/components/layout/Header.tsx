'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useBreadcrumbTailLabel } from '@/lib/breadcrumb-context';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/crm': 'CRM',
  '/dashboard/settings': 'Settings',
  '/dashboard/profile': 'My Profile',
  '/dashboard/explore': 'Explore Sarajevo',
  '/dashboard/explore/businesses': 'Businesses',
  '/dashboard/explore/businesses/new': 'New Business',
  '/dashboard/explore/attractions': 'Attractions',
  '/dashboard/explore/attractions/new': 'New Attraction',
  '/dashboard/explore/events': 'Events',
  '/dashboard/explore/events/new': 'New Event',
  '/dashboard/explore/categories': 'Categories',
  '/dashboard/explore/categories/new': 'New Category',
  '/dashboard/explore/types': 'Types',
  '/dashboard/explore/types/new': 'New Type',
  '/dashboard/explore/sections': 'Sections',
  '/dashboard/explore/sections/new': 'New Section',
  '/dashboard/explore/brands': 'Brands',
  '/dashboard/explore/brands/new': 'New Brand',
  '/dashboard/hotspot': 'Hotspot',
  '/dashboard/hotspot/pregled': 'Hotspot',
  '/dashboard/hotspot/hero-video': 'Hero video',
  '/dashboard/hotspot/hero-banneri': 'Hero banneri',
  '/dashboard/hotspot/news-carousel': 'News carousel',
  '/dashboard/hotspot/navigacija': 'Navigacija',
  '/dashboard/hotspot/blokovi': 'Blokovi',
  '/dashboard/hotspot/deal-blokovi': 'Blokovi',
  '/dashboard/hotspot/kampanje': 'Kampanje',
  '/dashboard/hotspot/play-win': 'Play & Win',
  '/dashboard/hotspot/pametno-odabrano': 'Pametno odabrano',
  '/dashboard/hotspot/explore-sarajevo': 'Explore Sarajevo',
  '/dashboard/hotspot/postavke': 'Postavke',
  '/dashboard/pametno': 'Pametno Odabrano',
  '/dashboard/pametno/products': 'Products',
  '/dashboard/pametno/products/new': 'New Product',
  '/dashboard/pametno/categories': 'Categories',
  '/dashboard/pametno/categories/new': 'New Category',
  '/dashboard/pametno/brands': 'Brands',
  '/dashboard/pametno/brands/new': 'New Brand',
  '/dashboard/pametno/collections': 'Collections',
  '/dashboard/pametno/collections/new': 'New Collection',
  '/dashboard/pametno/tags': 'Tags',
  '/dashboard/pametno/tags/new': 'New Tag',
};

// For dynamic routes (edit pages), we show "Uredi" instead of the ID
const getDynamicLabel = (path: string, segment: string): string | null => {
  // Check if this segment is a number (edit page) 
  if (/^\d+$/.test(segment)) {
    // Check what entity type we're editing based on the path
    if (path.includes('/businesses/')) return 'Uredi biznis';
    if (path.includes('/attractions/')) return 'Uredi atrakciju';
    if (path.includes('/events/')) return 'Uredi događaj';
    if (path.includes('/categories/')) return 'Uredi kategoriju';
    if (path.includes('/types/')) return 'Uredi tip';
    if (path.includes('/sections/')) return 'Uredi sekciju';
    if (path.includes('/brands/')) return 'Uredi brend';
    if (path.includes('/products/')) return 'Uredi proizvod';
    if (path.includes('/collections/')) return 'Uredi kolekciju';
    if (path.includes('/tags/')) return 'Uredi tag';
    return 'Uredi';
  }
  return null;
};

/** Hotspot sub-routes: breadcrumb label from i18n so BS/EN matches the language switcher. */
const HOTSPOT_BREADCRUMB_KEYS: Record<string, string> = {
  '/dashboard/hotspot': 'nav.hotspot',
  '/dashboard/hotspot/pregled': 'nav.hotspotPregled',
  '/dashboard/hotspot/hero-video': 'nav.hotspotHeroVideo',
  '/dashboard/hotspot/hero-banneri': 'nav.hotspotHeroBanneri',
  '/dashboard/hotspot/news-carousel': 'nav.hotspotNewsCarousel',
  '/dashboard/hotspot/navigacija': 'nav.hotspotNavigacija',
  '/dashboard/hotspot/blokovi': 'nav.hotspotBlokovi',
  '/dashboard/hotspot/deal-blokovi': 'nav.hotspotBlokovi',
  '/dashboard/hotspot/play-win': 'nav.hotspotPlayWin',
  '/dashboard/hotspot/pametno-odabrano': 'nav.hotspotPametno',
  '/dashboard/hotspot/explore-sarajevo': 'nav.hotspotExplore',
  '/dashboard/hotspot/kampanje': 'nav.hotspotKampanje',
  '/dashboard/hotspot/postavke': 'nav.hotspotPostavke',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const tailLabel = useBreadcrumbTailLabel();
  const [hotspotRefreshSpin, setHotspotRefreshSpin] = React.useState(false);

  React.useEffect(() => {
    const onStart = () => setHotspotRefreshSpin(true);
    const onEnd = () => setHotspotRefreshSpin(false);
    if (typeof window === 'undefined') return;
    window.addEventListener('saraya-hotspot-refresh-start', onStart);
    window.addEventListener('saraya-hotspot-refresh-end', onEnd);
    return () => {
      window.removeEventListener('saraya-hotspot-refresh-start', onStart);
      window.removeEventListener('saraya-hotspot-refresh-end', onEnd);
    };
  }, []);

  const isHotspotSection = pathname.startsWith('/dashboard/hotspot');

  // Generate breadcrumb
  const getBreadcrumb = () => {
    const parts = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];
    
    let currentPath = '';
    for (const part of parts) {
      currentPath += `/${part}`;
      
      // First check for exact match in pageTitles
      let title = pageTitles[currentPath];
      const hotspotKey = HOTSPOT_BREADCRUMB_KEYS[currentPath];
      if (hotspotKey) {
        title = t(hotspotKey);
      }
      
      // If no exact match, check if it's a dynamic segment (like an ID)
      if (!title) {
        const dynamicLabel = getDynamicLabel(pathname, part);
        if (dynamicLabel) {
          title = dynamicLabel;
        } else {
          title = part.charAt(0).toUpperCase() + part.slice(1);
        }
      }
      
      breadcrumbs.push({ label: title, href: currentPath });
    }
    
    if (tailLabel && breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1] = {
        ...breadcrumbs[breadcrumbs.length - 1],
        label: tailLabel,
      };
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumb();
  
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="h-[60px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left side - Menu button + Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 bg-white text-slate-700 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
                {isLast ? (
                  <span className="max-w-[10rem] truncate text-sm font-semibold text-slate-900 sm:max-w-xs">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="shrink-0 text-sm text-slate-500 hover:text-slate-900 hover:underline"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
          </nav>
        </div>
        
        {/* Right side — Hotspot: reload CMS data from server without leaving the page */}
        <div className="flex items-center gap-2">
          {isHotspotSection && (
            <button
              type="button"
              aria-label={language === 'bs' ? 'Osvježi podatke' : 'Refresh data'}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('saraya-hotspot-refresh-request'));
                }
              }}
              disabled={hotspotRefreshSpin}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 sm:px-3"
            >
              <RefreshCw className={`h-4 w-4 shrink-0 ${hotspotRefreshSpin ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {language === 'bs' ? 'Osvježi podatke' : 'Refresh data'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
