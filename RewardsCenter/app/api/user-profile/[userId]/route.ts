import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
async function calculateStreak(supabase: typeof supabaseAdmin, accountId: string): Promise<number> {
  const { data: claims, error } = await supabase
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
    } else {
      break
    }
  }

  return streak
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Fetch user stats
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('account_id', userId)
      .single();

    // Fetch friends count (accepted friendships where user is either requester or addressee)
    const { count: friendsCount, error: friendsError } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .not('accepted_at', 'is', null)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    // Fetch unlocked achievements with details
    const { data: userAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        id,
        unlocked_at,
        achievement:rewards_achievements (
          id,
          code,
          title,
          description,
          icon,
          category
        )
      `)
      .eq('account_id', userId)
      .not('unlocked_at', 'is', null)
      .order('unlocked_at', { ascending: false })
      .limit(10);

    // Count total unlocked achievements
    const { count: achievementsCount, error: achievementsCountError } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', userId)
      .not('unlocked_at', 'is', null);

    // Calculate daily streak from daily_rewards table
    const currentStreak = await calculateStreak(supabase, userId);

    // Build response
    const profileData = {
      stats: {
        tournamentsWon: userStats?.tournaments_won ?? 0,
        tournamentsEntered: userStats?.tournaments_entered ?? 0,
        ordersCompleted: userStats?.orders_completed ?? 0,
        currentStreak: currentStreak,
        longestStreak: userStats?.longest_streak ?? 0,
      },
      friendsCount: friendsCount ?? 0,
      achievementsCount: achievementsCount ?? 0,
      recentAchievements: userAchievements?.map(ua => ({
        id: (ua.achievement as any)?.id,
        code: (ua.achievement as any)?.code,
        title: (ua.achievement as any)?.title,
        icon: (ua.achievement as any)?.icon,
        category: (ua.achievement as any)?.category,
        unlockedAt: ua.unlocked_at,
      })) ?? [],
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
