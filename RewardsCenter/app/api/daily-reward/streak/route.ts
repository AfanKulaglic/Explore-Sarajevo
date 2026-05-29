import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Get current date in CET (Central European Time) as YYYY-MM-DD
function getTodayCET(): string {
  const now = new Date()
  const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  const year = cetDate.getFullYear()
  const month = String(cetDate.getMonth() + 1).padStart(2, '0')
  const day = String(cetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get yesterday's date in CET as YYYY-MM-DD
function getYesterdayCET(): string {
  const now = new Date()
  const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  cetDate.setDate(cetDate.getDate() - 1)
  const year = cetDate.getFullYear()
  const month = String(cetDate.getMonth() + 1).padStart(2, '0')
  const day = String(cetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Calculate the current streak for a user
async function calculateStreak(accountId: string): Promise<number> {
  const { data: claims, error } = await supabaseAdmin
    .from('daily_rewards')
    .select('claim_date')
    .eq('account_id', accountId)
    .order('claim_date', { ascending: false })
    .limit(100)

  if (error || !claims || claims.length === 0) {
    return 0
  }

  const todayCET = getTodayCET()
  const yesterdayCET = getYesterdayCET()
  
  const firstClaim = claims[0].claim_date
  if (firstClaim !== todayCET && firstClaim !== yesterdayCET) {
    return 0
  }

  let streak = 0
  let expectedDate = firstClaim === todayCET ? todayCET : yesterdayCET
  
  for (const claim of claims) {
    if (claim.claim_date === expectedDate) {
      streak++
      const date = new Date(expectedDate + 'T12:00:00Z')
      date.setDate(date.getDate() - 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      expectedDate = `${year}-${month}-${day}`
    } else if (claim.claim_date < expectedDate) {
      break
    }
  }

  return streak
}

// Calculate streak multiplier: 1.1x on day 1, 1.2x on day 2, ..., 2.0x on day 10+
function calculateMultiplier(streak: number): number {
  if (streak <= 0) {
    return 1.0 // No streak = no bonus
  }
  // Day 1 = 1.1x, Day 2 = 1.2x, ..., Day 10+ = 2.0x
  const multiplier = 1.0 + (Math.min(streak, 10) * 0.1)
  return Math.round(multiplier * 10) / 10 // Round to 1 decimal place
}

/**
 * GET /api/daily-reward/streak - Get user's current streak and multiplier
 * 
 * Query params:
 * - account_id: The user's account ID (required)
 * 
 * Response:
 * {
 *   streak: number,           // Current streak count (days)
 *   multiplier: number,       // Current multiplier (1.0 - 2.0)
 *   multiplierFormatted: string  // Formatted multiplier (e.g., "1.5x")
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' }, 
        { status: 400 }
      )
    }

    const streak = await calculateStreak(accountId)
    const multiplier = calculateMultiplier(streak)

    return NextResponse.json({
      streak,
      multiplier,
      multiplierFormatted: `${multiplier}x`
    })
  } catch (error) {
    console.error('Error in GET /api/daily-reward/streak:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
