import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, db } from "@/lib/supabaseDb";
import { requireAdmin } from "@/lib/auth/adminGuard";

async function getSystemPlatform() {
  const { data: existing, error: selectError } = await db
    .from('platforms')
    .select('id')
    .eq('code', 'SYSTEM')
    .maybeSingle();

  if (existing) return existing.id;

  // Generate UUID for platform id
  const platformId = crypto.randomUUID();
  const { data: newPlatform, error: insertError } = await db
    .from('platforms')
    .insert({
      id: platformId,
      code: 'SYSTEM',
      name: 'System',
      type: 'BACKOFFICE',
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating SYSTEM platform:', insertError);
    return null;
  }

  return newPlatform?.id || null;
}

export async function PATCH(request: NextRequest, { params }: { params: { accountId: string } }) {
  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  const body = await request.json();
  const { status, name, email, password, avatarUrl, balanceDelta, tokensDelta, xpDelta } = body ?? {};

  try {
    // Update email and/or password in Supabase Auth if provided
    if (email || password) {
      const { data: account } = await db
        .from('accounts')
        .select('supabase_user_id')
        .eq('id', params.accountId)
        .single();

      if (account?.supabase_user_id) {
        const authUpdates: any = {};
        if (email) authUpdates.email = email;
        if (password) authUpdates.password = password;

        await supabaseAdmin.auth.admin.updateUserById(
          account.supabase_user_id,
          authUpdates
        );
      }
    }

    // Update account
    const updates: any = {};
    if (status) updates.status = status;
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatarUrl) updates.avatar_url = avatarUrl;

    if (Object.keys(updates).length > 0) {
      await db
        .from('accounts')
        .update(updates)
        .eq('id', params.accountId);
    }

    // Update balance if specified
    if (balanceDelta) {
      const { data: wallet } = await db
        .from('coin_wallets')
        .select('coins_balance')
        .eq('account_id', params.accountId)
        .single();

      if (wallet) {
        await db
          .from('coin_wallets')
          .update({ coins_balance: wallet.coins_balance + balanceDelta })
          .eq('account_id', params.accountId);
      }
    }

    // Update tokens if specified
    if (tokensDelta) {
      const { data: wallet } = await db
        .from('coin_wallets')
        .select('tokens_balance')
        .eq('account_id', params.accountId)
        .single();

      if (wallet) {
        await db
          .from('coin_wallets')
          .update({ tokens_balance: wallet.tokens_balance + tokensDelta })
          .eq('account_id', params.accountId);
      }
    }

    // Update XP if specified
    if (xpDelta) {
      const { data: xpProfile } = await db
        .from('xp_profiles')
        .select('xp_total, xp_current_level, xp_next_level, level')
        .eq('account_id', params.accountId)
        .single();

      if (xpProfile) {
        const newXpTotal = xpProfile.xp_total + xpDelta;
        const newXpCurrentLevel = xpProfile.xp_current_level + xpDelta;
        
        // Check if level up (simple: every 1000 XP = 1 level)
        let newLevel = xpProfile.level;
        let newXpCurrent = newXpCurrentLevel;
        let newXpNext = xpProfile.xp_next_level;
        
        while (newXpCurrent >= newXpNext) {
          newXpCurrent -= newXpNext;
          newLevel += 1;
          newXpNext = newLevel * 1000; // Each level requires level * 1000 XP
        }
        
        await db
          .from('xp_profiles')
          .update({ 
            xp_total: newXpTotal,
            xp_current_level: newXpCurrent,
            xp_next_level: newXpNext,
            level: newLevel,
            last_level_up_at: newLevel > xpProfile.level ? new Date().toISOString() : undefined
          })
          .eq('account_id', params.accountId);
      }
    }

    // Create activity event if balance, tokens, or XP changed
    if (balanceDelta || tokensDelta || xpDelta) {
      const systemPlatformId = await getSystemPlatform();
      console.log('Creating activity event:', {
        account_id: params.accountId,
        platform_id: systemPlatformId,
        balanceDelta,
        tokensDelta,
        xpDelta
      });
      if (systemPlatformId) {
        const { data: activityData, error: activityError } = await db.from('activity_events').insert({
          account_id: params.accountId,
          platform_id: systemPlatformId,
          event_type: 'OTHER',
          coins_delta: balanceDelta || 0,
          tokens_delta: tokensDelta || 0,
          xp_delta: xpDelta || 0,
          metadata: { 
            adjusted_by: adminUser.email,
            action: 'ADMIN_ADJUSTMENT'
          },
        }).select();
        if (activityError) {
          console.error('Activity insert error:', activityError);
        } else {
          console.log('Activity created:', activityData);
        }
      } else {
        console.error('Failed to get/create SYSTEM platform');
      }
    }

    // Create audit log
    await db.from('admin_audit_logs').insert({
      admin_account_id: params.accountId,
      action: "ACCOUNT_UPDATED",
      description: `Account updated by ${adminUser.email}`,
      metadata: body,
    });

    // Fetch updated account with relations
    const [
      { data: account },
      { data: wallet },
      { data: xpProfile },
    ] = await Promise.all([
      db.from('accounts').select('*').eq('id', params.accountId).single(),
      db.from('coin_wallets').select('*').eq('account_id', params.accountId).single(),
      db.from('xp_profiles').select('*').eq('account_id', params.accountId).single(),
    ]);

    const fullAccount = {
      ...account,
      wallet: wallet || null,
      xp_profile: xpProfile || null,
    };

    return NextResponse.json({ data: fullAccount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { accountId: string } }) {
  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    // Create audit log before deletion
    await db.from('admin_audit_logs').insert({
      admin_account_id: params.accountId,
      target_account_id: params.accountId,
      action: "ACCOUNT_DELETED",
      description: `Account permanently deleted by ${adminUser.email}`,
    });

    // Delete related records (cascade deletes should handle most, but being explicit)
    await Promise.all([
      db.from('activity_events').delete().eq('account_id', params.accountId),
      db.from('xp_profiles').delete().eq('account_id', params.accountId),
      db.from('coin_wallets').delete().eq('account_id', params.accountId),
    ]);

    // Finally delete the account itself
    await db
      .from('accounts')
      .delete()
      .eq('id', params.accountId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
