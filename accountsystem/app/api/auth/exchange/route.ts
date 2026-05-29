import { NextRequest, NextResponse } from "next/server";
import { consumeSsoCode } from "@/lib/ssoCodes";
import { db } from "@/lib/supabaseDb";

function buildError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return buildError("code is required", 400);
  }

  const record = await consumeSsoCode(code);

  if (!record) {
    return buildError("Invalid or expired code", 410);
  }

  const { data: account, error } = await db
    .from("accounts")
    .select(`
      *,
      coin_wallets!coin_wallets_account_id_fkey(coins_balance, tokens_balance),
      xp_profiles!xp_profiles_account_id_fkey(level, xp_total, xp_current_level, xp_next_level)
    `)
    .eq("supabase_user_id", record.account_id)
    .eq("is_deleted", false)
    .single();

  if (error || !account) {
    return buildError("Account not found", 404);
  }

  const expiresAt = record.session_expires_at
    ? Math.floor(new Date(record.session_expires_at).getTime() / 1000)
    : null;

  return NextResponse.json({
    success: true,
    session: {
      access_token: record.access_token,
      refresh_token: record.refresh_token,
      expires_at: expiresAt,
      expires_in: expiresAt ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000)) : null,
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
}
