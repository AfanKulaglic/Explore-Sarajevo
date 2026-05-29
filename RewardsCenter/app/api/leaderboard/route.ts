import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { normalizeAvatarUrl } from '@/lib/avatar-url'
import {
  getAccountTotalCoins,
  getAccountXpProfile,
  asAccountRecord,
} from '@/lib/account-api'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'https://accounts.saraya.solutions'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

// Calculate badge tier based on total coins earned
function calculateBadge(totalCoins: number): string {
  if (totalCoins >= 10000000) return 'DIAMOND'    // 10M+
  if (totalCoins >= 1000000) return 'PLATINUM'    // 1M+
  if (totalCoins >= 100000) return 'GOLD'         // 100K+
  if (totalCoins >= 10000) return 'SILVER'        // 10K+
  return 'BRONZE'
}

// Calculate rating (0.5-5 stars) based on total coins earned
function calculateRating(totalCoins: number): number {
  if (totalCoins >= 500000) return 5    // 500K+ = 5 stars
  if (totalCoins >= 400000) return 4.5  // 400K+ = 4.5 stars
  if (totalCoins >= 300000) return 4    // 300K+ = 4 stars
  if (totalCoins >= 250000) return 3.5  // 250K+ = 3.5 stars
  if (totalCoins >= 200000) return 3    // 200K+ = 3 stars
  if (totalCoins >= 150000) return 2.5  // 150K+ = 2.5 stars
  if (totalCoins >= 100000) return 2    // 100K+ = 2 stars
  if (totalCoins >= 75000) return 1.5   // 75K+ = 1.5 stars
  if (totalCoins >= 50000) return 1     // 50K+ = 1 star
  if (totalCoins >= 25000) return 0.5   // 25K+ = 0.5 stars
  return 0
}

// Get user settings to check who opted out of leaderboard
async function getHiddenUserIds(): Promise<Set<string>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('account_id')
      .eq('show_on_leaderboard', false)
    
    if (error) {
      console.error('Error fetching hidden users:', error)
      return new Set()
    }
    
    return new Set((data || []).map(row => row.account_id))
  } catch (error) {
    console.error('Error in getHiddenUserIds:', error)
    return new Set()
  }
}

/**
 * GET /api/leaderboard - Get leaderboard entries from real accounts
 * Ranks users by total coins earned (coins_balance + coins_spent)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch users who opted out of leaderboard
    const hiddenUserIds = await getHiddenUserIds()

    // Fetch all accounts from central API
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts?limit=1000`, {
      headers: {
        'x-admin-email': ADMIN_EMAIL
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch accounts:', await response.text())
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }

    const result = await response.json()
    const accounts = result.data || []

    // Transform accounts to leaderboard entries, filtering out hidden users
    let entries = accounts
      .filter((account: any) => !hiddenUserIds.has(account.id))
      .map((account: any) => {
      const row = asAccountRecord(account)
      const totalCoinsEarned = getAccountTotalCoins(row)
      const xpProfile = getAccountXpProfile(row)
      const xp = xpProfile?.xp_total || 0
      const level = xpProfile?.level || 1

      return {
        id: account.id,
        name: account.name || account.email?.split('@')[0] || 'Anonymous',
        email: account.email,
        coins: totalCoinsEarned, // Display total coins earned
        xp: xp,
        level: level,
        avatarUrl: normalizeAvatarUrl(account.avatar_url),
        badge: calculateBadge(totalCoinsEarned),
        rating: calculateRating(totalCoinsEarned),
        streak: Math.floor(Math.random() * 30), // TODO: Implement real streak tracking
      }
    })

    // Sort by total coins earned (descending)
    entries.sort((a: any, b: any) => b.coins - a.coins)

    // Add ranks
    entries = entries.slice(0, limit).map((entry: any, index: number) => ({
      ...entry,
      rank: index + 1
    }))

    return NextResponse.json({ 
      data: entries,
      total: accounts.length
    })
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
