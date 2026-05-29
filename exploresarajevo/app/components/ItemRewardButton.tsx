'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Coins, Check, Sparkles } from 'lucide-react'
import { useRewards, REWARDS_CONFIG } from '../lib/reward-context'
import { refreshSarayaAccount } from '../lib/saraya-account'

interface Props { itemSlug: string; itemType: 'business' | 'attraction'; tier: 'premium' | 'highlighted' | 'regular'; className?: string }
const COUNTDOWN = 20

export function ItemRewardButton({ itemSlug, itemType, tier, className = '' }: Props) {
  const { status, claimItemRead, hasReadItem, canEarnMore, refreshStatus } = useRewards()
  const [countdown, setCountdown] = useState(COUNTDOWN)
  const [isCounting, setIsCounting] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [earnedCoins, setEarnedCoins] = useState<number | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasStarted = useRef(false)
  const alreadyRead = hasReadItem(itemSlug, itemType)

  const baseReward = tier === 'premium' ? REWARDS_CONFIG.PREMIUM_ITEM : tier === 'highlighted' ? REWARDS_CONFIG.HIGHLIGHTED_ITEM : REWARDS_CONFIG.REGULAR_ITEM

  useEffect(() => {
    if (!alreadyRead && !claimed && canEarnMore && status.authenticated && !hasStarted.current) {
      hasStarted.current = true; setIsCounting(true)
    }
  }, [alreadyRead, claimed, canEarnMore, status.authenticated])

  useEffect(() => {
    if (isCounting && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(p => {
          if (p <= 1) { clearInterval(timerRef.current!); timerRef.current = null; setIsCounting(false); return 0 }
          return p - 1
        })
      }, 1000)
      return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
    }
  }, [isCounting, countdown])

  const handleClaim = async () => {
    if (countdown > 0 || claimed || alreadyRead || isClaiming) return
    setClaimError(null); setIsClaiming(true)
    const result = await claimItemRead(itemSlug, itemType, tier)
    if (result.success && result.coins) { setClaimed(true); setEarnedCoins(result.coins); await refreshSarayaAccount(); await refreshStatus() }
    else if (result.alreadyRead) { setClaimed(true); await refreshStatus() }
    else if (result.maxReached) setClaimError(`Daily limit reached (${REWARDS_CONFIG.MAX_DAILY_ITEM_COINS} coins)`)
    else setClaimError(result.error || 'Could not claim reward.')
    setIsClaiming(false)
  }

  if (status.loading) return null

  if (!status.authenticated) {
    return (
      <Link href="/auth/login"
        className={`group flex items-center gap-3 rounded-2xl px-5 py-4 transition ${className}`}
        style={{ border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.08)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--violet)' }}>
          <Coins className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#a78bfa] mb-0.5">Earn coins</p>
          <p className="text-sm font-semibold text-white group-hover:text-[#a78bfa] transition">Sign in to start earning</p>
        </div>
      </Link>
    )
  }

  if (alreadyRead || claimed) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${className}`}
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--violet)' }}>
          <Check className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#a78bfa] mb-0.5">Reward</p>
          <p className="text-sm font-semibold text-white">{earnedCoins ? `+${earnedCoins} coins earned` : 'Already claimed today'}</p>
        </div>
      </div>
    )
  }

  if (!canEarnMore) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${className}`}
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[#5a5a72]" style={{ background: 'var(--bg-muted)' }}>
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#5a5a72] mb-0.5">Daily limit</p>
          <p className="text-sm font-semibold text-[#a0a0b8]">{REWARDS_CONFIG.MAX_DAILY_ITEM_COINS} coins reached today</p>
        </div>
      </div>
    )
  }

  if (countdown > 0) {
    const progress = ((COUNTDOWN - countdown) / COUNTDOWN) * 100
    return (
      <div className={`relative overflow-hidden rounded-2xl px-5 py-4 ${className}`}
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div className="absolute inset-0 transition-all duration-1000" style={{ width: `${progress}%`, background: 'rgba(124,58,237,0.15)' }} />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[#a78bfa]" style={{ background: 'rgba(124,58,237,0.2)' }}>
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#a78bfa] mb-0.5">Reading…</p>
            <p className="text-sm font-semibold text-white">+{baseReward} coins in <span className="tabular-nums">{countdown}s</span></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <button type="button" onClick={handleClaim} disabled={isClaiming}
        className="group w-full flex items-center gap-3 rounded-2xl px-5 py-4 text-white transition shadow-lg disabled:opacity-60"
        style={{ background: 'var(--violet)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Coins className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/70 mb-0.5">Reward · ready</p>
          <p className="text-sm font-semibold">{isClaiming ? 'Claiming…' : `Claim +${baseReward} coins`}</p>
        </div>
      </button>
      {claimError && <p className="mt-2 text-center text-xs text-red-400">{claimError}</p>}
    </div>
  )
}
