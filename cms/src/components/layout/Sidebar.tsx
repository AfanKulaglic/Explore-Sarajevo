'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Calendar,
  Folder,
  Tag,
  Layers,
  Award,
  LogOut,
  X,
  Package,
  ChevronDown,
  Globe,
  Smartphone,
  Zap,
  Users,
  Settings,
  Video,
  Image,
  Newspaper,
  Navigation as NavigationIcon,
  Gamepad2,
  Sparkles,
  Grid3X3,
  Megaphone
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

// Navigation items now use translation keys
const exploreNavItems: NavItem[] = [
  { labelKey: 'entities.businesses', href: '/dashboard/explore/businesses', icon: Building2 },
  { labelKey: 'entities.attractions', href: '/dashboard/explore/attractions', icon: MapPin },
  { labelKey: 'entities.events', href: '/dashboard/explore/events', icon: Calendar },
  { labelKey: 'entities.categories', href: '/dashboard/explore/categories', icon: Folder },
  { labelKey: 'entities.types', href: '/dashboard/explore/types', icon: Tag },
  { labelKey: 'entities.sections', href: '/dashboard/explore/sections', icon: Layers },
  { labelKey: 'entities.brands', href: '/dashboard/explore/brands', icon: Award }
];

const pametnoNavItems: NavItem[] = [
  { labelKey: 'entities.products', href: '/dashboard/pametno/products', icon: Package },
  { labelKey: 'entities.categories', href: '/dashboard/pametno/categories', icon: Folder },
  { labelKey: 'entities.brands', href: '/dashboard/pametno/brands', icon: Award },
  { labelKey: 'entities.collections', href: '/dashboard/pametno/collections', icon: Layers },
  { labelKey: 'entities.tags', href: '/dashboard/pametno/tags', icon: Tag }
];

const hotspotNavItems: NavItem[] = [
  { labelKey: 'nav.hotspotPregled', href: '/dashboard/hotspot', icon: Grid3X3 },
  { labelKey: 'nav.hotspotHeroVideo', href: '/dashboard/hotspot/hero-video', icon: Video },
  { labelKey: 'nav.hotspotHeroBanneri', href: '/dashboard/hotspot/hero-banneri', icon: Image },
  { labelKey: 'nav.hotspotNewsCarousel', href: '/dashboard/hotspot/news-carousel', icon: Newspaper },
  { labelKey: 'nav.hotspotNavigacija', href: '/dashboard/hotspot/navigacija', icon: NavigationIcon },
  { labelKey: 'nav.hotspotBlokovi', href: '/dashboard/hotspot/blokovi', icon: Grid3X3 },
  { labelKey: 'nav.hotspotPlayWin', href: '/dashboard/hotspot/play-win', icon: Gamepad2 },
  { labelKey: 'nav.hotspotPametno', href: '/dashboard/hotspot/pametno-odabrano', icon: Sparkles },
  { labelKey: 'nav.hotspotExplore', href: '/dashboard/hotspot/explore-sarajevo', icon: MapPin },
  { labelKey: 'nav.hotspotKampanje', href: '/dashboard/hotspot/kampanje', icon: Megaphone },
  { labelKey: 'nav.hotspotPostavke', href: '/dashboard/hotspot/postavke', icon: Settings },
];

const crmNavItems: NavItem[] = [
  { labelKey: 'entities.clients', href: '/dashboard/crm', icon: Users }
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);
  const { language, setLanguage, t, languages } = useLanguage();
  
  const handleClose = () => onMobileClose?.();
  
  // Close mobile menu on route change only
  const previousPathname = React.useRef(pathname);
  React.useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      onMobileClose?.();
    }
  }, [pathname, onMobileClose]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Static color map for section headers (purge-safe)
  const sectionColors: Record<string, string> = {
    explore: 'bg-emerald-500',
    pametno: 'bg-orange-500',
    hotspot: 'bg-violet-500',
    crm: 'bg-blue-500',
  };

  const hotspotLinkActive = (href: string) => {
    if (href === '/dashboard/hotspot') {
      return pathname === '/dashboard/hotspot' || pathname === '/dashboard/hotspot/pregled';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderNavLink = (item: NavItem) => {
    const active = item.href.startsWith('/dashboard/hotspot')
      ? hotspotLinkActive(item.href)
      : pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-[9px] text-sm rounded-[var(--radius-md)] transition-all duration-200',
          active
            ? 'bg-[var(--color-primary)] text-white font-medium'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Icon className={cn('w-[18px] h-[18px]', active ? 'text-white' : 'text-slate-400')} />
        <span>{t(item.labelKey)}</span>
      </Link>
    );
  };

  const renderSectionHeader = (title: string, Icon: React.ElementType, section: string) => {
    const isExpanded = expandedSections.includes(section);
    const colorClass = sectionColors[section];
    return (
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClass)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700">
            {title}
          </span>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-slate-400 transition-transform duration-200',
          isExpanded ? 'rotate-0' : '-rotate-90'
        )} />
      </button>
    );
  };

  const renderSection = (title: string, Icon: React.ElementType, section: string, items: NavItem[]) => (
    <div>
      {renderSectionHeader(title, Icon, section)}
      {expandedSections.includes(section) && (
        <div className="mt-1 ml-2 space-y-0.5">
          {items.map(renderNavLink)}
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-slate-900">Saraya CMS</h1>
            <p className="text-[11px] text-slate-400">Content Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Top-level Dashboard link */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm rounded-[var(--radius-md)] transition-all duration-200',
              pathname === '/dashboard'
                ? 'bg-[var(--color-primary)] text-white font-medium' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <LayoutDashboard className={cn('w-5 h-5', pathname === '/dashboard' ? 'text-white' : 'text-slate-400')} />
            <span className="font-medium">Dashboard</span>
          </Link>
        </div>

        <div className="space-y-2">
          {renderSection(t('nav.crm'), Users, 'crm', crmNavItems)}
          {renderSection(t('nav.exploreSarajevo'), Globe, 'explore', exploreNavItems)}
          {renderSection(t('nav.pametnoOdabrano'), Package, 'pametno', pametnoNavItems)}
          {renderSection(t('nav.hotspot'), Smartphone, 'hotspot', hotspotNavItems)}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-slate-100">
        {/* User info - clickable to profile */}
        <Link
          href="/dashboard/profile"
          className={cn(
            'flex items-center gap-3 px-3 py-3 mb-3 rounded-xl transition-colors',
            pathname === '/dashboard/profile'
              ? 'bg-blue-50 ring-1 ring-blue-200'
              : 'bg-slate-50 hover:bg-slate-100'
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-slate-900 truncate">
              {user?.email || 'Admin'}
            </p>
            <p className="text-[11px] text-slate-400">{t('nav.profile')}</p>
          </div>
        </Link>
        
        {/* Settings link - Owner only */}
        {user?.role === 'owner' && (
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center gap-3 w-full px-4 py-2 text-[13px] rounded-lg transition-colors mb-1',
              pathname === '/dashboard/settings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Settings className="w-4 h-4" />
            <span>{t('nav.settings')}</span>
          </Link>
        )}
        
        {/* Logout + Language Switcher Row */}
        <div className="flex items-center gap-2 px-2">
          {/* Logout button */}
          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
          
          {/* Language Switcher */}
          <div className="flex gap-1 flex-1">
            {Object.values(languages).map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as 'bs' | 'en')}
                className={cn(
                  'flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  language === lang.code
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                )}
              >
                {lang.flag} {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile sidebar */}
      <aside 
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-out shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
      
      {/* Desktop sidebar - always visible */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[280px] z-10 border-r border-slate-200 bg-white">
        {sidebarContent}
      </aside>
    </>
  );
}
