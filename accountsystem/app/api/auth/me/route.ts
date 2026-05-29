import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, db } from "@/lib/supabaseDb";

/**
 * Get current user info from access token
 * GET /api/auth/me
 * 
 * Headers: Authorization: Bearer <access_token>
 * Returns: { success, user, account }
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get the account record with wallet and XP data
    const { data: account, error: accountError } = await db
      .from('accounts')
      .select(`
        *,
        coin_wallets!coin_wallets_account_id_fkey(coins_balance, tokens_balance),
        xp_profiles!xp_profiles_account_id_fkey(level, xp_total, xp_current_level, xp_next_level)
      `)
      .eq('supabase_user_id', user.id)
      .eq('is_deleted', false)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: account.name,
      },
      account: {
        id: account.id,
        email: account.email,
        name: account.name,
        status: account.status,
        avatar_url: account.avatar_url,
        coins: account.coin_wallets?.coins_balance || 0,
        tokens: account.coin_wallets?.tokens_balance || 0,
        xp: account.xp_profiles?.xp_total || 0,
        level: account.xp_profiles?.level || 1,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
