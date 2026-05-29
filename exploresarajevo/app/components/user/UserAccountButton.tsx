'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Loader2, ChevronDown, Gift, Gamepad2, Brain, ShoppingBag, Wifi, ExternalLink } from 'lucide-react'
import { useSarayaAccount } from '@/app/lib/saraya-account'

const SARAYA_APPS = [
  { name: 'Saraya Connect',    href: 'https://hs.saraya.solutions/',     icon: Wifi },
  { name: 'Rewards Center',   href: 'https://rewards.saraya.solutions/', icon: Gift },
  { name: 'Quiz',             href: 'https://quiz.saraya.solutions/',    icon: Brain },
  { name: 'Play & Win',       href: 'https://saraya.games/',             icon: Gamepad2 },
  { name: 'Pametno Odabrano', href: 'https://pametnoodabrano.com/',      icon: ShoppingBag },
]

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString()
}

interface Props {
  user: { email: string; name?: string } | null
  isLoading?: boolean
  onLogout: () => void
  onProfileClick?: () => void
  variant?: 'light' | 'dark'
  showDropdown?: boolean
}

export function UserAccountButton({ user, isLoading = false, onLogout, onProfileClick, variant = 'dark', showDropdown = true }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { account, tier } = useSarayaAccount()

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ border: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
        <Loader2 className="animate-spin text-[#5a5a72]" size={18} />
      </div>
    )
  }

  if (!user) {
    return (
      <Link href="/auth/login"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold tracking-wide text-white transition"
        style={{ background: 'var(--violet)', boxShadow: '0 0 15px rgba(124,58,237,0.3)' }}>
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    )
  }

  const displayName = account?.name || user.name || user.email
  const avatarUrl = account?.avatar_url

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => showDropdown && setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full p-1 sm:px-2 sm:py-1.5 transition hover:bg-white/5"
      >
        <div className="relative h-8 w-8 sm:h-9 sm:w-9">
          {avatarUrl
            ? <Image src={avatarUrl} alt={displayName} fill sizes="36px" className="rounded-full object-cover" />
            : <div className="flex h-full w-full items-center justify-center rounded-full text-white" style={{ background: 'var(--violet)' }}><User className="w-4 h-4" /></div>
          }
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#09090f]" style={{ backgroundColor: tier.color }} />
        </div>
        <div className="hidden md:block text-left leading-tight">
          <p className="font-semibold text-xs text-white">{displayName.length > 16 ? `${displayName.slice(0, 16)}…` : displayName}</p>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#5a5a72]">Lv {account?.level ?? 1} · {tier.name}</p>
        </div>
        {showDropdown && <ChevronDown size={14} className={`hidden md:block text-[#5a5a72] transition-transform ${showMenu ? 'rotate-180' : ''}`} />}
      </button>

      <AnimatePresence>
        {showMenu && showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl shadow-2xl z-50"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="px-4 py-4" style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0">
                  {avatarUrl
                    ? <Image src={avatarUrl} alt={displayName} fill sizes="48px" className="rounded-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center rounded-full text-white" style={{ background: 'var(--violet)' }}><User className="w-5 h-5" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate text-sm">{displayName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="text-[10px] uppercase tracking-widest text-[#5a5a72] font-bold">{tier.name} · Lv {account?.level ?? 1}</span>
                  </div>
                </div>
              </div>
              {account && (
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <Stat label="Coins" value={fmt(account.coins ?? 0)} color="text-[#a78bfa]" />
                  <Stat label="XP" value={fmt(account.xp ?? 0)} color="text-green-400" />
                  <Stat label="Tokens" value={fmt(account.tokens ?? 0)} color="text-pink-400" />
                </div>
              )}
            </div>

            {onProfileClick && (
              <button onClick={() => { setShowMenu(false); onProfileClick(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#a0a0b8] hover:text-white hover:bg-white/5 transition"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <User size={16} className="text-[#7c3aed]" /><span>My Profile</span>
              </button>
            )}

            <div className="py-2">
              <p className="px-4 py-2 text-[9px] uppercase tracking-[0.25em] font-bold text-[#5a5a72]">Saraya Apps</p>
              {SARAYA_APPS.map(app => (
                <a key={app.name} href={app.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[#a0a0b8] hover:text-white hover:bg-white/5 transition group">
                  <app.icon className="w-4 h-4 text-[#7c3aed]" />
                  <span className="flex-1">{app.name}</span>
                  <ExternalLink className="w-3 h-3 text-[#5a5a72] opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>

            <a href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm text-[#a0a0b8] hover:text-[#a78bfa] hover:bg-white/5 transition"
              style={{ borderTop: '1px solid var(--border)' }}>
              <span className="inline-block w-1 h-1 rounded-full bg-[#7c3aed]" />
              <span className="flex-1 font-medium">sarayasolutions.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button onClick={() => { setShowMenu(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition"
              style={{ borderTop: '1px solid var(--border)' }}>
              <LogOut size={16} /><span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`font-bold text-base ${color}`}>{value}</p>
      <p className="text-[8px] uppercase tracking-widest text-[#5a5a72] font-bold mt-0.5">{label}</p>
    </div>
  )
}
