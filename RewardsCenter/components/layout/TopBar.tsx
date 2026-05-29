'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { UserAvatar } from "@/components/common/UserAvatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Crown, Gift, Trophy, Coins, Star, ChevronRight, Check, Users, LogIn, Loader2, Sparkles, Gamepad2, Brain, MapPin, ShoppingBag, Wifi } from "lucide-react";

// Saraya ecosystem app links (excluding current app - RewardsCenter)
const SARAYA_APPS = [
  { name: 'Saraya Connect', href: 'https://hs.saraya.solutions/', icon: Wifi, color: 'from-blue-500 to-cyan-500' },
  { name: 'Quiz', href: 'https://quiz.saraya.solutions/', icon: Brain, color: 'from-violet-500 to-purple-500' },
  { name: 'Play & Win', href: 'https://saraya.games/', icon: Gamepad2, color: 'from-pink-500 to-rose-500' },
  { name: 'Explore Sarajevo', href: 'https://bihdiscovery.com/', icon: MapPin, color: 'from-emerald-500 to-teal-500' },
  { name: 'Pametno Odabrano', href: 'https://pametnoodabrano.com/', icon: ShoppingBag, color: 'from-orange-500 to-amber-500' },
];
import { BalanceBadge } from "@/components/common/BalanceBadge";
import { MobileMenu } from "./MobileMenu";
import { UserProfile, UserWallet } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useSarayaAccount } from "@/lib/saraya-account";
import { useNotifications, Notification } from "@/lib/notifications-context";
import { useFriends } from "@/lib/friends-context";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";

type TopBarProps = {
  profile: UserProfile;
  wallet: UserWallet;
  isLoading?: boolean;
};

// Helper to get icon for notification type
function getNotificationIcon(type: string) {
  switch (type) {
    case 'ACHIEVEMENT':
      return <Trophy size={18} className="text-amber-400" />;
    case 'LEVEL_UP':
      return <Star size={18} className="text-violet-400" />;
    case 'REWARD':
      return <Gift size={18} className="text-brand-400" />;
    case 'COINS':
      return <Coins size={18} className="text-emerald-400" />;
    case 'PROMO':
      return <Sparkles size={18} className="text-rose-400" />;
    default:
      return <Bell size={18} className="text-white/60" />;
  }
}

// Helper to format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

const LogoMark = () => (
  <span className="flex h-12 w-12 items-center justify-center">
    <img src="/sarayalogoicon.png" alt="Saraya" className="h-12 w-12 object-contain" />
  </span>
);

export function TopBar({ profile, wallet, isLoading }: TopBarProps) {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const { account, tier } = useSarayaAccount();
  const { notifications, unreadCount, markAsRead, markAllAsRead, setPendingNotification } = useNotifications();
  const { friendRequestCount } = useFriends();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      markAsRead([notification.id]);
    }
    
    // Set pending notification to show popup (no redirect)
    setPendingNotification(notification);
    
    // Close dropdown
    setShowNotifications(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <MobileMenu />
          
          <LogoMark />
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/60">{t.nav.rewardsCenter}</p>
            <p className="text-lg sm:text-xl font-semibold text-white">Saraya Solutions</p>
          </div>
        </div>

        {/* Balance badges - hidden on small screens, shown in simplified form on medium */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2 lg:gap-3">
          <BalanceBadge
            label="Coins"
            value={wallet.coins.toLocaleString()}
            icon={<Coins size={18} />}
            accent="from-amber-400 to-amber-600"
          />
          <BalanceBadge
            label={t.common.tokens}
            value={wallet.tokens.toLocaleString()}
            icon={<Gift size={18} />}
            accent="from-violet-500 to-purple-600"
          />
          <BalanceBadge
            label={t.common.level}
            value={wallet.level.toString()}
            icon={<Star size={18} />}
            accent="from-emerald-400 to-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher - always visible */}
          <LanguageSwitcher />
          
          {/* Show only Login button for guests */}
          {!isAuthenticated && !isLoading && (
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-brand-500 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:shadow-brand-500/40"
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Authenticated user buttons */}
          {isAuthenticated && (
            <>
              {/* Friends Button */}
              <Link
                href="/friends"
                className="relative hidden sm:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 text-white transition hover:border-brand-500/60 hover:bg-brand-500/10"
              >
                <Users size={18} />
                {friendRequestCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white">
                    {friendRequestCount > 9 ? '9+' : friendRequestCount}
                  </span>
                )}
              </Link>

              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 text-white transition hover:border-brand-500/60 hover:bg-brand-500/10"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-full sm:mt-2 sm:w-96 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/98 backdrop-blur-xl shadow-2xl z-50"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-400">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs text-white/50 transition hover:text-brand-400"
                          >
                            <Check size={14} />
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto scrollbar-hover">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-white/40">
                            <Bell size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5 ${
                                !notification.read_at ? 'bg-brand-500/5' : ''
                              }`}
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                {getNotificationIcon(notification.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                                  {!notification.read_at && (
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-white/50 line-clamp-2">{notification.body}</p>
                                <p className="mt-1 text-xs text-white/30">{formatRelativeTime(notification.created_at)}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <Link
                        href="/account"
                        onClick={() => setShowNotifications(false)}
                        className="flex items-center justify-center gap-2 border-t border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-brand-400 transition hover:bg-white/10"
                      >
                        View all notifications
                        <ChevronRight size={16} />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Account Button */}
              {isLoading ? (
                <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 px-4 py-2">
                  <Loader2 className="animate-spin text-white/60" size={20} />
                </div>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 p-1 sm:px-2 sm:py-1 transition hover:border-brand-500/40 hover:bg-brand-500/10"
                  >
                    <div className="relative h-8 w-8 sm:h-10 sm:w-10">
                      <UserAvatar
                        src={profile.avatarUrl}
                        name={profile.name}
                        fill
                        sizes="40px"
                        className="rounded-xl sm:rounded-2xl object-cover"
                      />
                      <span
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-slate-900"
                        style={{ backgroundColor: account ? tier.color : '#34d399' }}
                      />
                    </div>
                    <div className="hidden text-sm leading-tight sm:block">
                      <p className="font-semibold text-white">{profile.name}</p>
                      <p className="text-white/60">
                        {account ? `${tier.name} • Lv ${account.level ?? '--'}` : profile.handle}
                      </p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
                      >
                        <Link
                          href="/account"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 transition hover:bg-white/5"
                        >
                          <Users size={16} />
                          {t.header.myAccount}
                        </Link>
                        <Link
                          href="/rewards/orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 transition hover:bg-white/5"
                        >
                          <Gift size={16} />
                          {t.header.myOrders}
                        </Link>
                        
                        {/* Mobile-only: Coins, Tokens, XP display */}
                        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
                                <Coins size={12} className="text-white" />
                              </span>
                              <span className="text-xs text-white/60">{t.account.coins}</span>
                            </div>
                            <span className="text-sm font-semibold text-white">{wallet.coins.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                <Gift size={12} className="text-white" />
                              </span>
                              <span className="text-xs text-white/60">{t.account.tokens}</span>
                            </div>
                            <span className="text-sm font-semibold text-white">{wallet.tokens.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                                <Star size={12} className="text-white" />
                              </span>
                              <span className="text-xs text-white/60">{t.account.xp}</span>
                            </div>
                            <span className="text-sm font-semibold text-white">{wallet.xp.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Saraya Apps Navigation */}
                        <div className="border-t border-white/10">
                          <div className="px-4 py-2 text-white/40">
                            <p className="text-[10px] uppercase tracking-wider font-medium">Saraya Apps</p>
                          </div>
                          <div className="px-2 pb-2 space-y-0.5">
                            {SARAYA_APPS.map((app) => (
                              <a
                                key={app.name}
                                href={app.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowUserMenu(false)}
                                className="group flex items-center gap-3 px-2 py-2 rounded-xl transition hover:bg-white/10"
                              >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                                  <app.icon size={16} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-white/80 group-hover:text-white">
                                  {app.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                        
                        <hr className="border-white/10" />
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
                        >
                          <LogIn size={16} className="rotate-180" />
                          {t.common.signOut}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
