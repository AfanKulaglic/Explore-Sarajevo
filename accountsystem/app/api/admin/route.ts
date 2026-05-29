import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabaseDb";
import { requireAdmin } from "@/lib/auth/adminGuard";

export async function GET(request: NextRequest) {
  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  const [
    { count: accountCount },
    { count: suspendedCount },
    { data: wallets },
    { data: recentActivities }
  ] = await Promise.all([
    db
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false),
    db
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'SUSPENDED'),
    db
      .from('coin_wallets')
      .select('coins_balance, tokens_balance'),
    db
      .from('activity_events')
      .select(`
        *,
        account:accounts(*),
        platform:platforms(*)
      `)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const coinsTreasury = wallets?.reduce((sum, w) => sum + (w.coins_balance || 0), 0) || 0;
  const tokensTreasury = wallets?.reduce((sum, w) => sum + (w.tokens_balance || 0), 0) || 0;

  // Transform activities to include summary
  const transformedActivities = recentActivities?.map(activity => {
    const coinsPart = activity.coins_delta !== 0 ? `${activity.coins_delta > 0 ? '+' : ''}${activity.coins_delta} coins` : '';
    const tokensPart = activity.tokens_delta !== 0 ? `${activity.tokens_delta > 0 ? '+' : ''}${activity.tokens_delta} tokens` : '';
    const xpPart = activity.xp_delta !== 0 ? `${activity.xp_delta > 0 ? '+' : ''}${activity.xp_delta} XP` : '';
    const parts = [coinsPart, tokensPart, xpPart].filter(Boolean);
    const summary = parts.length > 0 
      ? `${activity.event_type}: ${parts.join(', ')}`
      : activity.event_type;

    return {
      id: activity.id,
      summary,
      createdAt: activity.created_at,
      platform: activity.platform,
      account: activity.account,
    };
  }) || [];

  return NextResponse.json({
    data: {
      totals: {
        accounts: accountCount || 0,
        suspended: suspendedCount || 0,
        coinsTreasury,
        tokensTreasury,
      },
      recentActivities: transformedActivities,
    },
  });
}

