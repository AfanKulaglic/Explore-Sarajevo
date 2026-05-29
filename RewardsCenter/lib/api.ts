import { Reward, RewardOrder, Tournament } from './types'

// Helper to convert database response to frontend Reward type
export function dbRewardToReward(dbReward: any): Reward {
  return {
    id: dbReward.id,
    title: dbReward.title,
    subtitle: dbReward.subtitle,
    description: dbReward.description,
    imageUrl: dbReward.image_url,
    type: dbReward.type,
    category: dbReward.category,
    price: dbReward.price,
    currency: dbReward.currency,
    stock: dbReward.stock,
    requiresApproval: dbReward.requires_approval,
    tags: dbReward.tags || [],
    expiresAt: dbReward.expires_at,
  }
}

// Helper to convert database response to frontend Tournament type
export function dbTournamentToTournament(dbTournament: any): Tournament {
  return {
    id: dbTournament.id,
    title: dbTournament.title,
    description: dbTournament.description,
    imageUrl: dbTournament.image_url,
    type: dbTournament.type,
    status: dbTournament.status,
    startDate: dbTournament.start_date,
    endDate: dbTournament.end_date,
    entryFee: dbTournament.entry_fee,
    entryCurrency: dbTournament.entry_currency,
    maxParticipants: dbTournament.max_participants,
    currentParticipants: dbTournament.current_participants || 0,
    rules: dbTournament.rules || [],
    xpReward: dbTournament.xp_reward,
    featured: dbTournament.featured,
    topParticipants: [], // Will be populated separately if needed
    prizes: (dbTournament.prizes || dbTournament.tournament_prizes)?.map((p: any) => ({
      place: p.place,
      coins: p.coins || 0,
      xp: p.xp || 0,
      badge: p.badge,
    })) || [],
  }
}

// API functions for fetching data
export async function fetchRewards(params?: {
  category?: string
  type?: string
  featured?: boolean
  limit?: number
}): Promise<Reward[]> {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.set('category', params.category)
  if (params?.type) searchParams.set('type', params.type)
  if (params?.featured) searchParams.set('featured', 'true')
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  
  const response = await fetch(`/api/rewards?${searchParams}`)
  if (!response.ok) {
    throw new Error('Failed to fetch rewards')
  }
  
  const { data } = await response.json()
  return data?.map(dbRewardToReward) || []
}

export async function fetchRewardById(id: string): Promise<Reward | null> {
  const response = await fetch(`/api/rewards/${id}`)
  if (!response.ok) {
    return null
  }
  
  const { data } = await response.json()
  return data ? dbRewardToReward(data) : null
}

export async function fetchCategories(): Promise<{ slug: string; name: string; icon: string }[]> {
  const response = await fetch('/api/categories')
  if (!response.ok) {
    return []
  }
  
  const { data } = await response.json()
  return data || []
}

export async function fetchTournaments(status?: string): Promise<Tournament[]> {
  const searchParams = new URLSearchParams()
  if (status) searchParams.set('status', status)
  
  const response = await fetch(`/api/tournaments?${searchParams}`)
  if (!response.ok) {
    throw new Error('Failed to fetch tournaments')
  }
  
  const { data } = await response.json()
  return data?.map(dbTournamentToTournament) || []
}

export async function createOrder(params: {
  rewardId: string
  quantity: number
  shippingAddress?: any
  couponCode?: string
}): Promise<{ success: boolean; order?: any; error?: string }> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    return { success: false, error: data.error || 'Failed to create order' }
  }
  
  return { success: true, order: data.data }
}

// Tournament participation functions
export interface TournamentParticipation {
  id: string
  tournamentId: string
  tournament: Tournament
  score: number
  rank: number | null
  joinedAt: string
  eliminatedAt: string | null
  prizeClaimed: boolean
}

export interface UserTournamentStats {
  active: number
  won: number
  totalEarnings: number
  participations: TournamentParticipation[]
}

export async function joinTournament(
  tournamentId: string,
  accountId: string,
  accountEmail: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account_id: accountId, account_email: accountEmail }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    return { success: false, error: data.error || 'Failed to join tournament' }
  }
  
  return { success: true }
}

export async function leaveTournament(
  tournamentId: string,
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/tournaments/${tournamentId}/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account_id: accountId }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    return { success: false, error: data.error || 'Failed to leave tournament' }
  }
  
  return { success: true }
}

export async function getUserTournaments(accountId: string): Promise<UserTournamentStats> {
  const response = await fetch(`/api/tournaments/user?account_id=${accountId}`)
  
  if (!response.ok) {
    return { active: 0, won: 0, totalEarnings: 0, participations: [] }
  }
  
  const data = await response.json()
  return data
}

export async function checkTournamentParticipation(
  tournamentId: string,
  accountId: string
): Promise<boolean> {
  const response = await fetch(`/api/tournaments/${tournamentId}/participation?account_id=${accountId}`)
  
  if (!response.ok) {
    return false
  }
  
  const data = await response.json()
  return data.isParticipant
}
