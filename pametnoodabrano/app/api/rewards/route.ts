import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const REWARDS_URL = process.env.NEXT_PUBLIC_REWARDS_URL || 'https://rewards.saraya.solutions'

// Reward configuration
const DAILY_LOGIN_REWARD = 500
const ARTICLE_READ_REWARD = 50
const MAX_DAILY_ARTICLES = 30
const MAX_DAILY_ARTICLE_COINS = ARTICLE_READ_REWARD * MAX_DAILY_ARTICLES // 1500

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

/**
 * GET /api/rewards - Get current daily reward status for the user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const supabase = createCentralSupabaseClient()
    const sc = supabase.schema('sarayaconnect')
    const accounts = supabase.schema('accountsystem')
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get account ID
    const { data: account } = await accounts
      .from('accounts_accounts')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const today = getTodayCET()

    // Get today's record
    let { data: record } = await sc
      .from('pametno_daily_rewards')
      .select('*')
      .eq('account_id', account.id)
      .eq('reward_date', today)
      .single()
    
    // Get streak info
    const { streak, multiplier } = await getStreakMultiplier(account.id)
    
    if (!record) {
      // No record yet - return default status
      return NextResponse.json({
        dailyLoginClaimed: false,
        articlesRead: 0,
        articlesCoinsEarned: 0,
        articleSlugs: [],
        maxArticles: MAX_DAILY_ARTICLES,
        maxArticleCoins: MAX_DAILY_ARTICLE_COINS,
        dailyLoginReward: DAILY_LOGIN_REWARD,
        articleReward: ARTICLE_READ_REWARD,
        streak,
        multiplier,
      })
    }
    
    return NextResponse.json({
      dailyLoginClaimed: record.daily_login_claimed,
      articlesRead: record.articles_read,
      articlesCoinsEarned: record.articles_coins_earned,
      articleSlugs: record.article_slugs || [],
      maxArticles: MAX_DAILY_ARTICLES,
      maxArticleCoins: MAX_DAILY_ARTICLE_COINS,
      dailyLoginReward: DAILY_LOGIN_REWARD,
      articleReward: ARTICLE_READ_REWARD,
      streak,
      multiplier,
    })
  } catch (error) {
    console.error('Error in GET /api/rewards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
