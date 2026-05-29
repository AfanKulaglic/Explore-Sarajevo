import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { grantExploreCoins, resolveAccountId } from '@/lib/rewards-account'

const REWARDS_URL = process.env.NEXT_PUBLIC_REWARDS_URL || 'https://rewards.saraya.solutions'

// Reward configuration - different rewards based on item type
const PREMIUM_ITEM_REWARD = 200    // Premium highlighted businesses/attractions
const HIGHLIGHTED_ITEM_REWARD = 100 // Highlighted businesses/attractions
const REGULAR_ITEM_REWARD = 50     // Regular businesses/attractions
const MAX_DAILY_ITEM_COINS = 1700

// Get current date in CET (Central European Time) as YYYY-MM-DD
function getTodayCET(): string {
  const now = new Date()
  const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  const year = cetDate.getFullYear()
  const month = String(cetDate.getMonth() + 1).padStart(2, '0')
  const day = String(cetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Create Supabase service client for central account system
function createCentralSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Get streak multiplier from RewardsCenter
async function getStreakMultiplier(accountId: string): Promise<{ streak: number; multiplier: number }> {
  try {
    const response = await fetch(
      `${REWARDS_URL}/api/daily-reward/streak?account_id=${encodeURIComponent(accountId)}`,
      { cache: 'no-store' }
    )
    if (response.ok) {
      const data = await response.json()
      return { streak: data.streak || 0, multiplier: data.multiplier || 1.0 }
    }
  } catch (error) {
    console.error('Failed to fetch streak multiplier:', error)
  }
  return { streak: 0, multiplier: 1.0 }
}

// Get base reward based on item tier
function getBaseReward(tier: string): number {
  switch (tier) {
    case 'premium':
      return PREMIUM_ITEM_REWARD
    case 'highlighted':
      return HIGHLIGHTED_ITEM_REWARD
    default:
      return REGULAR_ITEM_REWARD
  }
}

/**
 * POST /api/rewards/item-read - Claim reward for reading a business/attraction
 * Body: { itemSlug: string, itemType: 'business' | 'attraction', tier: 'premium' | 'highlighted' | 'regular' }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { itemSlug, itemType, tier = 'regular' } = body
    
    if (!itemSlug) {
      return NextResponse.json({ error: 'itemSlug is required' }, { status: 400 })
    }
    
    if (!itemType || !['business', 'attraction'].includes(itemType)) {
      return NextResponse.json({ error: 'itemType must be "business" or "attraction"' }, { status: 400 })
    }
    
    // Create service client for database operations
    const supabase = createCentralSupabaseClient()
    const sc = supabase.schema('sarayaconnect')
    const accounts = supabase.schema('accountsystem')

    // Verify the token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const accountId = await resolveAccountId(accounts, user.email!)
    if (!accountId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const today = getTodayCET()

    // Get or create today's record
    let { data: record, error: recordError } = await sc
      .from('es_daily_rewards')
      .select('*')
      .eq('account_id', accountId)
      .eq('reward_date', today)
      .single()

    if (recordError && recordError.code !== 'PGRST116') {
      console.error('Error fetching record:', recordError)
    }

    if (!record) {
      // Create new record
      const { data: newRecord, error: createError } = await sc
        .from('es_daily_rewards')
        .insert({
          account_id: accountId,
          reward_date: today,
          daily_login_claimed: false,
          items_read: 0,
          items_coins_earned: 0,
          item_slugs: [],
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Failed to create record:', createError)
        return NextResponse.json({ error: 'Database error', details: createError.message }, { status: 500 })
      }
      record = newRecord
    }
    
    // Create unique key for item (type + slug to differentiate businesses from attractions)
    const itemKey = `${itemType}:${itemSlug}`
    
    // Check if already read this item today
    const itemSlugs: string[] = record.item_slugs || []
    if (itemSlugs.includes(itemKey)) {
      return NextResponse.json({
        success: false,
        error: 'Already read this item today',
        alreadyRead: true,
        itemsRead: record.items_read,
        itemsCoinsEarned: record.items_coins_earned,
        maxItemCoins: MAX_DAILY_ITEM_COINS,
      })
    }
    
    // Check if max coins reached
    if (record.items_coins_earned >= MAX_DAILY_ITEM_COINS) {
      return NextResponse.json({
        success: false,
        error: 'Max daily item coins reached',
        maxReached: true,
        itemsRead: record.items_read,
        itemsCoinsEarned: record.items_coins_earned,
        maxItemCoins: MAX_DAILY_ITEM_COINS,
      })
    }
    
    // Get streak multiplier
    const { streak, multiplier } = await getStreakMultiplier(accountId)
    
    // Calculate reward based on tier
    const baseReward = getBaseReward(tier)
    const finalReward = Math.round(baseReward * multiplier)
    
    // Check if this reward would exceed the max
    const potentialTotal = record.items_coins_earned + finalReward
    const actualReward = potentialTotal > MAX_DAILY_ITEM_COINS 
      ? MAX_DAILY_ITEM_COINS - record.items_coins_earned 
      : finalReward
    
    if (actualReward <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Max daily item coins reached',
        maxReached: true,
        itemsRead: record.items_read,
        itemsCoinsEarned: record.items_coins_earned,
        maxItemCoins: MAX_DAILY_ITEM_COINS,
      })
    }
    
    // Grant coins
    const granted = await grantExploreCoins(
      accounts,
      accountId,
      actualReward,
      `${itemType} read: ${itemSlug} (${tier}, ${multiplier}x streak bonus)`,
      { itemSlug, itemType, event_type: 'ITEM_READ' }
    )

    if (!granted) {
      return NextResponse.json({ error: 'Failed to grant coins' }, { status: 500 })
    }

    // Update record
    const newItemsRead = record.items_read + 1
    const newItemsCoinsEarned = record.items_coins_earned + actualReward
    const newItemSlugs = [...itemSlugs, itemKey]

    const { error: updateError } = await sc
      .from('es_daily_rewards')
      .update({
        items_read: newItemsRead,
        items_coins_earned: newItemsCoinsEarned,
        item_slugs: newItemSlugs,
      })
      .eq('account_id', accountId)
      .eq('reward_date', today)
    
    if (updateError) {
      console.error('Failed to update record:', updateError)
    }
    
    return NextResponse.json({
      success: true,
      coinsEarned: actualReward,
      baseReward,
      tier,
      streak,
      multiplier,
      itemsRead: newItemsRead,
      itemsCoinsEarned: newItemsCoinsEarned,
      maxItemCoins: MAX_DAILY_ITEM_COINS,
      remainingCoins: MAX_DAILY_ITEM_COINS - newItemsCoinsEarned,
    })
  } catch (error) {
    console.error('Error in POST /api/rewards/item-read:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
