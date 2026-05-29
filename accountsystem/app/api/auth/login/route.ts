import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabaseDb";
import { createClient } from "@supabase/supabase-js";

/**
 * Public login endpoint for all platforms
 * POST /api/auth/login
 * 
 * Body: { email, password }
 * Returns: { success, user, session, account }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate with Supabase Auth
    // IMPORTANT: Use a disposable client so we don't taint the shared supabaseAdmin
    // with a user session (which would cause RLS to apply on subsequent requests)
    const disposableClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: authData, error: authError } = await disposableClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || "Invalid credentials" },
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
      .eq('supabase_user_id', authData.user.id)
      .eq('is_deleted', false)
      .single();

    if (accountError || !account) {
      // User exists in Supabase Auth but not in accounts table
      // This shouldn't happen normally, but handle gracefully
      return NextResponse.json(
        { success: false, error: "Account not found. Please register first." },
        { status: 404 }
      );
    }

    // Check account status
    if (account.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: "Account is suspended. Please contact support." },
        { status: 403 }
      );
    }

    if (account.status === 'DELETED') {
      return NextResponse.json(
        { success: false, error: "Account has been deleted." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: account.name,
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
        expires_in: authData.session?.expires_in,
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
