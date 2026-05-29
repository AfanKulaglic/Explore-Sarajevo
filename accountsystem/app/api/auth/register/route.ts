import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, db } from "@/lib/supabaseDb";
import { PLATFORM_CATALOG } from "@/lib/platforms";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Public registration endpoint for all platforms
 * POST /api/auth/register
 * 
 * Body: { email, password, name }
 * Returns: { success, user, session, account }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 15) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 15 characters for security" },
        { status: 400 }
      );
    }

    // Check if account already exists
    const { data: existingAccount } = await db
      .from('accounts')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingAccount) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name || '',
      },
    });

    if (authError || !authData.user) {
      console.error("Auth user creation error:", authError);
      return NextResponse.json(
        { success: false, error: authError?.message || "Failed to create account" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Create account record
    const { data: account, error: accountError } = await db
      .from('accounts')
      .insert({
        supabase_user_id: userId,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (accountError || !account) {
      console.error("Account creation error:", accountError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { success: false, error: "Failed to create account record" },
        { status: 500 }
      );
    }

    // Create wallet
    const { error: walletError } = await db
      .from('coin_wallets')
      .insert({
        account_id: account.id,
        coins_balance: 0,
        tokens_balance: 0,
      });

    if (walletError) {
      console.error("Wallet creation error:", walletError);
    }

    // Create XP profile
    const { error: xpError } = await db
      .from('xp_profiles')
      .insert({
        account_id: account.id,
        level: 1,
        xp_total: 0,
        xp_current_level: 0,
        xp_next_level: 1000,
      });

    if (xpError) {
      console.error("XP profile creation error:", xpError);
    }

    // Create platform memberships for all platforms
    const allPlatformCodes = PLATFORM_CATALOG.map(p => p.code);
    
    // Ensure platforms exist
    for (const code of allPlatformCodes) {
      const platformMeta = PLATFORM_CATALOG.find((p) => p.code === code);
      if (!platformMeta) continue;

      const { data: existing } = await db
        .from('platforms')
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) {
        await db.from('platforms').insert({
          id: randomUUID(),
          code,
          name: platformMeta.name,
          type: platformMeta.type,
        });
      }
    }

    // Get platforms and create memberships
    const { data: platforms } = await db
      .from('platforms')
      .select('id, code')
      .in('code', allPlatformCodes);

    // Sign in to get session tokens
    // IMPORTANT: Use a disposable client so we don't taint the shared supabaseAdmin
    // with a user session (which would cause RLS to apply on subsequent requests)
    const disposableClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: signInData, error: signInError } = await disposableClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Auto sign-in error:", signInError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: email,
        name: name || email.split('@')[0],
      },
      session: signInData?.session ? {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_at: signInData.session.expires_at,
        expires_in: signInData.session.expires_in,
      } : null,
      account: {
        id: account.id,
        email: account.email,
        name: account.name,
        status: account.status,
        coins: 0,
        tokens: 0,
        xp: 0,
        level: 1,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
