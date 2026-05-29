'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Trophy, Settings, Loader2, ChevronDown, Gift, Gamepad2, MapPin, ShoppingBag, Wifi } from 'lucide-react'

// Saraya ecosystem app links (excluding current app - SarayaQuiz)
const SARAYA_APPS = [
  { name: 'Saraya Connect', href: 'https://hs.saraya.solutions/', icon: Wifi, color: 'from-blue-500 to-cyan-500' },
  { name: 'Rewards Center', href: 'https://rewards.saraya.solutions/', icon: Gift, color: 'from-amber-500 to-orange-500' },
  { name: 'Play & Win', href: 'https://saraya.games/', icon: Gamepad2, color: 'from-pink-500 to-rose-500' },
  { name: 'Explore Sarajevo', href: 'https://bihdiscovery.com/', icon: MapPin, color: 'from-emerald-500 to-teal-500' },
  { name: 'Pametno Odabrano', href: 'https://pametnoodabrano.com/', icon: ShoppingBag, color: 'from-orange-500 to-amber-500' },
]
import { useSarayaAccount } from '@/lib/saraya-account'
import { AchievementsModal } from './AchievementsModal'

// Format large numbers compactly
function formatCompact(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toLocaleString()
}

interface UserAccountButtonProps {
  user: {
    email: string
    name: string
  } | null
  isLoading?: boolean
  onLogout: () => void
  onProfileClick?: () => void
  variant?: 'light' | 'dark'
  showDropdown?: boolean
}

export function UserAccountButton({
  user,
  isLoading = false,
  onLogout,
  onProfileClick,
  variant = 'light',
  showDropdown = true,
}: UserAccountButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { account, tier } = useSarayaAccount()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isDark = variant === 'dark'
  const bgClass = isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white/20 border-white/30'
  const hoverClass = isDark ? 'hover:bg-slate-800' : 'hover:bg-white/30'
  const textClass = isDark ? 'text-white' : 'text-white'
  const subtextClass = isDark ? 'text-white/60' : 'text-white/70'
  const menuBgClass = isDark ? 'bg-slate-900 border-white/10' : 'bg-white/90 backdrop-blur-xl border-white/20'
  const menuTextClass = isDark ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 ${bgClass}`}>
        <Loader2 className={`animate-spin ${textClass}/60`} size={20} />
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth/user-login"
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-violet-500/25"
      >
        <User size={18} />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    )
  }

  const displayName = account?.name || user.name
  const avatarUrl = account?.avatar_url

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => showDropdown && setShowMenu(!showMenu)}
        className={`flex items-center gap-2 sm:gap-3 rounded-2xl border p-1 sm:px-3 sm:py-2 transition ${bgClass} ${hoverClass}`}
      >
        {/* Avatar */}
        <div className="relative h-9 w-9 sm:h-10 sm:w-10">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              sizes="40px"
              className="rounded-xl sm:rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          {/* Status dot with tier color */}
          <span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-900"
            style={{ backgroundColor: tier.color }}
          />
        </div>

        {/* Name & Level */}
        <div className="hidden sm:block text-left leading-tight">
          <p className={`font-semibold text-sm ${textClass}`}>{displayName}</p>
          <p className={`text-xs ${subtextClass}`}>
            {tier.name} • Lv {account?.level ?? '--'}
          </p>
        </div>

        {showDropdown && (
          <ChevronDown
            size={16}
            className={`hidden sm:block ${subtextClass} transition-transform ${showMenu ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border shadow-2xl z-50 ${menuBgClass}`}
          >
            {/* User Info Header */}
            <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      fill
                      sizes="48px"
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {displayName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: tier.color, color: '#000' }}
                    >
                      {tier.name}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      Lv {account?.level ?? 1}
                    </span>
                  </div>
                </div>
              </div>
              {/* Stats row */}
              {account && (
                <div className={`flex items-center justify-between gap-2 mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="text-center flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isDark ? 'text-amber-400' : 'text-amber-600'}`} title={account.coins?.toLocaleString()}>
                      {formatCompact(account.coins ?? 0)}
                    </p>
                    <p className={`text-[9px] uppercase tracking-wide ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      Coins
                    </p>
                  </div>
                  <div className={`w-px h-8 flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className="text-center flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} title={account.xp?.toLocaleString()}>
                      {formatCompact(account.xp ?? 0)}
                    </p>
                    <p className={`text-[9px] uppercase tracking-wide ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      XP
                    </p>
                  </div>
                  <div className={`w-px h-8 flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className="text-center flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isDark ? 'text-pink-400' : 'text-pink-600'}`} title={account.tokens?.toLocaleString()}>
                      {formatCompact(account.tokens ?? 0)}
                    </p>
                    <p className={`text-[9px] uppercase tracking-wide ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      Tokens
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {onProfileClick ? (
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onProfileClick()
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${menuTextClass}`}
                >
                  <User size={16} />
                  My Profile
                </button>
              ) : (
                <Link
                  href="/profile"
                  onClick={() => setShowMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${menuTextClass}`}
                >
                  <User size={16} />
                  My Profile
                </Link>
              )}
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowAchievements(true)
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${menuTextClass}`}
              >
                <Trophy size={16} />
                Achievements
              </button>
            </div>

            {/* Saraya Apps Navigation */}
            <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className={`px-4 py-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                <p className="text-[10px] uppercase tracking-wider font-medium">Saraya Apps</p>
              </div>
              <div className="px-2 pb-2 space-y-0.5">
                {SARAYA_APPS.map((app) => (
                  <a
                    key={app.name}
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-3 px-2 py-2 rounded-xl transition ${
                      isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <app.icon size={16} className="text-white" />
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white/80 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {app.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Sign Out */}
            <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowMenu(false)
                  onLogout()
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                  isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        account_id={account?.id}
        level={account?.level}
        xp={account?.xp}
        coins={account?.coins}
      />
    </div>
  )
}
