'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'saraya_account'

type Nullable<T> = T | null | undefined

export interface SarayaTier {
  name: string
  slug: string
  color: string
  gradient: string
  minLevel: number
}

export interface SarayaAccountProfile {
  id: string
  email: string
  name: string
  status?: string | null
  avatar_url?: Nullable<string>
  coins?: Nullable<number>
  tokens?: Nullable<number>
  xp?: Nullable<number>
  level?: Nullable<number>
}

export interface SarayaAccountSnapshot extends SarayaAccountProfile {
  coins: number
  tokens: number
  xp: number
  level: number
  status: string
  avatar_url: string | null
  tier: SarayaTier
}

const TIERS: SarayaTier[] = [
  { name: 'Explorer', slug: 'explorer', color: '#a5b4fc', gradient: 'from-indigo-500 to-purple-500', minLevel: 1 },
  { name: 'Champion', slug: 'champion', color: '#34d399', gradient: 'from-emerald-500 to-teal-500', minLevel: 10 },
  { name: 'Legend', slug: 'legend', color: '#f472b6', gradient: 'from-pink-500 to-rose-500', minLevel: 20 },
  { name: 'Mythic', slug: 'mythic', color: '#fbbf24', gradient: 'from-amber-400 to-orange-500', minLevel: 35 },
]

function resolveTier(level: number = 1): SarayaTier {
  const tier = [...TIERS].reverse().find((entry) => level >= entry.minLevel)
  return tier ?? TIERS[0]
}

export function normalizeSarayaAccount(account: SarayaAccountProfile): SarayaAccountSnapshot {
  const normalized = {
    id: account.id,
    email: account.email,
    name: account.name,
    status: account.status ?? 'ACTIVE',
    avatar_url: account.avatar_url ?? null,
    coins: Number(account.coins ?? 0),
    tokens: Number(account.tokens ?? 0),
    xp: Number(account.xp ?? 0),
    level: Number(account.level ?? 1),
  }

  return {
    ...normalized,
    tier: resolveTier(normalized.level),
  }
}

export function persistSarayaAccount(account?: SarayaAccountProfile | null) {
  if (typeof window === 'undefined') return null
  if (!account) {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('saraya-account-cleared'))
    return null
  }

  const snapshot = normalizeSarayaAccount(account)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  window.dispatchEvent(new CustomEvent('saraya-account-updated', { detail: snapshot }))
  return snapshot
}

export function readSarayaAccount(): SarayaAccountSnapshot | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as SarayaAccountSnapshot
    if (!parsed.tier) {
      parsed.tier = resolveTier(parsed.level ?? 1)
    }
    return parsed
  } catch (error) {
    console.warn('Failed to parse saraya_account payload', error)
    return null
  }
}

export function useSarayaAccount() {
  const [account, setAccount] = useState<SarayaAccountSnapshot | null>(() => {
    if (typeof window === 'undefined') return null
    return readSarayaAccount()
  })

  useEffect(() => {
    function syncFromStorage() {
      setAccount(readSarayaAccount())
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        syncFromStorage()
      }
    }

    function handleCustomEvent() {
      syncFromStorage()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('saraya-account-updated', handleCustomEvent as EventListener)
    window.addEventListener('saraya-account-cleared', handleCustomEvent as EventListener)

    syncFromStorage()

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('saraya-account-updated', handleCustomEvent as EventListener)
      window.removeEventListener('saraya-account-cleared', handleCustomEvent as EventListener)
    }
  }, [])

  const tier = account?.tier ?? resolveTier(account?.level ?? 1)

  return { account, tier }
}

export function clearSarayaAccount() {
  persistSarayaAccount(null)
}

/**
 * Force refresh account data from server
 * Call this after actions that modify coins/xp/tokens
 */
export async function refreshSarayaAccount(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const { createAuthSupabaseClient } = await import('@/app/lib/supabase-auth')
    const supabase = createAuthSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      console.log('[refreshSarayaAccount] No session')
      return false
    }
    
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data?.account) {
        persistSarayaAccount(data.account)
        console.log('[refreshSarayaAccount] Account refreshed:', data.account)
        return true
      }
    }
    return false
  } catch (e) {
    console.warn('[refreshSarayaAccount] Failed:', e)
    return false
  }
}
