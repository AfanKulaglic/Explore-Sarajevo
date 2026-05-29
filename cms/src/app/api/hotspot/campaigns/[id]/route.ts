import { NextRequest, NextResponse } from 'next/server';
import type { PostgrestError } from '@supabase/supabase-js';
import { sc } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function messageFromError(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as PostgrestError).message);
  }
  return e instanceof Error ? e.message : 'Unknown error';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if ('name' in body) updates.name = body.name;
    if ('slug' in body) updates.slug = body.slug;
    if ('is_active' in body) updates.is_active = body.is_active;
    if ('client_id' in body) {
      updates.client_id =
        body.client_id === null || body.client_id === '' || body.client_id === undefined
          ? null
          : Number(body.client_id);
    }
    if ('notes' in body) updates.notes = body.notes == null || body.notes === '' ? null : String(body.notes);
    if ('campaign_start_date' in body) updates.campaign_start_date = body.campaign_start_date || null;
    if ('campaign_end_date' in body) updates.campaign_end_date = body.campaign_end_date || null;
    if ('campaign_start_time' in body) updates.campaign_start_time = body.campaign_start_time || null;
    if ('campaign_end_time' in body) updates.campaign_end_time = body.campaign_end_time || null;
    if ('start_include_time' in body) updates.start_include_time = Boolean(body.start_include_time);
    if ('end_include_time' in body) updates.end_include_time = Boolean(body.end_include_time);
    updates.updated_at = new Date().toISOString();

    const flat = await sc
      .from('hs_marketing_campaigns')
      .update(updates)
      .eq('id', parseInt(id, 10))
      .select('*')
      .single();
    if (flat.error) throw flat.error;
    return NextResponse.json({ success: true, data: flat.data });
  } catch (e) {
    console.error('[hotspot/campaigns PUT]', e);
    return NextResponse.json(
      { success: false, error: messageFromError(e) || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { error } = await sc.from('hs_marketing_campaigns').delete().eq('id', parseInt(id, 10));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[hotspot/campaigns DELETE]', e);
    return NextResponse.json(
      { success: false, error: messageFromError(e) || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
