'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Gem, Zap, Trophy, X, User, Mail, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { useSarayaAccount, refreshSarayaAccount } from '@/app/lib/saraya-account'

interface Props { isOpen: boolean; onClose: () => void; email: string; name: string }

export function UserProfileModal({ isOpen, onClose, email, name }: Props) {
  const [refreshing, setRefreshing] = useState(false)
  const { account, tier } = useSarayaAccount()

  const handleRefresh = async () => { setRefreshing(true); await refreshSarayaAccount(); setRefreshing(false) }

  const xpProgress = account ? account.xp - (account.level - 1) * 100 : 0
  const progressPercent = account ? (xpProgress / 100) * 100 : 0
  const displayName = account?.name || name
  const avatarUrl = account?.avatar_url

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }} transition={{ type: 'spring', duration: 0.45 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pb-8 overflow-y-auto"
          >
            <div className="w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div className="relative px-6 pt-6 pb-8" style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
                {/* Violet glow */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 60%)' }} />

                <div className="relative flex items-center justify-between mb-5">
                  <span className="text-[#7c3aed] text-[10px] uppercase tracking-[0.3em] font-bold">◆ Member Profile</span>
                  <div className="flex items-center gap-1">
                    <button onClick={handleRefresh} disabled={refreshing}
                      className="p-2 rounded-full text-[#5a5a72] hover:text-white hover:bg-white/5 transition disabled:opacity-50">
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full text-[#5a5a72] hover:text-white hover:bg-white/5 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0">
                    {avatarUrl
                      ? <Image src={avatarUrl} alt={displayName} fill sizes="64px" className="rounded-full object-cover ring-2 ring-[#7c3aed]/50" />
                      : <div className="w-full h-full rounded-full flex items-center justify-center text-white ring-2 ring-[#7c3aed]/50" style={{ background: 'var(--violet)' }}><User className="w-7 h-7" /></div>
                    }
                    <span className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full ring-2 ring-[#0f0f1a] flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: tier.color }}>
                      {account?.level ?? 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl text-white font-bold truncate">{displayName}</h2>
                    <div className="flex items-center gap-1.5 mt-1 text-[#a0a0b8] text-xs">
                      <Mail className="w-3 h-3" /><span className="truncate">{email}</span>
                    </div>
                    <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: tier.color }}>
                      {tier.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {account && (
                  <div className="rounded-2xl p-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#a78bfa]" />
                        <span className="font-semibold text-white">Level {account.level}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#5a5a72] text-xs">
                        <Zap className="w-3.5 h-3.5 text-[#a78bfa]" />
                        <span>{account.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-[#5a5a72] uppercase tracking-wider font-bold">
                      <span>{xpProgress} XP</span>
                      <span>{Math.max(0, 100 - xpProgress)} XP to Lv {account.level + 1}</span>
                    </div>
                  </div>
                )}

                {account && (
                  <div className="grid grid-cols-2 gap-3">
                    <BalanceCard icon={<Coins className="w-5 h-5" />} label="Coins" value={account.coins.toLocaleString()} color="text-[#a78bfa]" />
                    <BalanceCard icon={<Gem className="w-5 h-5" />} label="Tokens" value={account.tokens.toLocaleString()} color="text-pink-400" />
                  </div>
                )}

                <div className="pt-2 text-center text-[10px] text-[#5a5a72] uppercase tracking-[0.3em] font-bold">
                  Saraya Solutions Member
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function BalanceCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
      <div className={`flex items-center justify-between mb-2 ${color}`}>{icon}<span className="text-[9px] uppercase tracking-widest font-bold text-[#5a5a72]">{label}</span></div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
