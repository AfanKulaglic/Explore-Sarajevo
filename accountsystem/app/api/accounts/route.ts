import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, db } from "@/lib/supabaseDb";
import { requireAdmin } from "@/lib/auth/adminGuard";
import { PLATFORM_CATALOG } from "@/lib/platforms";
import { randomUUID } from "crypto";

async function ensurePlatforms(codes: string[]) {
  const uniqueCodes = [...new Set(codes)].filter(Boolean);
  if (!uniqueCodes.length) return;

  for (const code of uniqueCodes) {
    const platformMeta = PLATFORM_CATALOG.find((platform) => platform.code === code);
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
}

export async function GET(request: NextRequest) {
  const maybeAdmin = await requireAdmin(request);
  if (maybeAdmin instanceof NextResponse) return maybeAdmin;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  let query = db
    .from('accounts')
    .select(`
      *,
      coin_wallets!coin_wallets_account_id_fkey(coins_balance, tokens_balance),
      xp_profiles!xp_profiles_account_id_fkey(level, xp_total, xp_current_level, xp_next_level)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(100);

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  const { data: accounts, error } = await query;

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: accounts });
}

export async function POST(request: NextRequest) {
  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  const body = await request.json();
  const {
    email,
    name,
    password,
    status = "ACTIVE",
    initialBalance = 0,
  } = body ?? {};
  const numericBalance = Number(initialBalance ?? 0);

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: "password is required" }, { status: 400 });
  }

  // Auto-enroll in all platforms
  const allPlatformCodes = PLATFORM_CATALOG.map(p => p.code);

  try {
    await ensurePlatforms(allPlatformCodes);
    
    // Create a user in Supabase Auth with provided password
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || '',
      },
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json({ error: `Failed to create auth user: ${authError.message}` }, { status: 500 });
    }

    const userId = authUser.user.id;
    
    // Create account
    const { data: account, error: accountError } = await db
      .from('accounts')
      .insert({
        supabase_user_id: userId,
        email,
        name,
        status,
      })
      .select()
      .single();

    if (accountError || !account) {
      console.error('Account creation error:', accountError);
      return NextResponse.json({ error: accountError?.message || 'Failed to create account' }, { status: 500 });
    }

    // Create wallet - try with minimal columns first
    const { data: walletData, error: walletError } = await db
      .from('coin_wallets')
      .insert({
        account_id: account.id,
      })
      .select();

    if (walletError) {
      console.error('Wallet creation error:', walletError);
    }

    // Update balance if wallet was created and initialBalance is non-zero
    if (walletData && walletData.length > 0 && numericBalance !== 0) {
      await db
        .from('coin_wallets')
        .update({ coins_balance: numericBalance })
        .eq('account_id', account.id);
    }

    // Create XP profile - try with minimal columns first
    const { error: xpError } = await db
      .from('xp_profiles')
      .insert({
        account_id: account.id,
      })
      .select();

    if (xpError) {
      console.error('XP profile creation error:', xpError);
    }

    // Create platform memberships for all platforms
    const { data: platforms } = await db
      .from('platforms')
      .select('id, code')
      .in('code', allPlatformCodes);

    // Create audit log
    await db.from('admin_audit_logs').insert({
      target_account_id: account.id,
      action: "ACCOUNT_CREATED",
      description: `Account created by ${adminUser.email}`,
      metadata: body,
    });

    // Fetch the complete account with relations
    const [
      { data: wallet },
      { data: xpProfile },
    ] = await Promise.all([
      db.from('coin_wallets').select('*').eq('account_id', account.id).single(),
      db.from('xp_profiles').select('*').eq('account_id', account.id).single(),
    ]);

    const fullAccount = {
      ...account,
      wallet: wallet || null,
      xp_profile: xpProfile || null,
    };

    return NextResponse.json({ data: fullAccount }, { status: 201 });
  } catch (error) {
    console.error('Account creation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create account" }, { status: 500 });
  }
}

