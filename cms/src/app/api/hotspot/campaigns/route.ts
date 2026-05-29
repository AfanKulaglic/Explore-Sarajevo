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

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const withClient = await sc
      .from('hs_marketing_campaigns')
      .select(
        `
        *,
        client:crm_clients(id, name)
      `
      )
      .order('name', { ascending: true });

    if (!withClient.error) {
      return NextResponse.json({ success: true, data: withClient.data || [] });
    }

    const flat = await sc
      .from('hs_marketing_campaigns')
      .select('*')
      .order('name', { ascending: true });
    if (flat.error) throw flat.error;
    return NextResponse.json({ success: true, data: flat.data || [] });
  } catch (e) {
    console.error('[hotspot/campaigns GET]', e);
    return NextResponse.json(
      { success: false, error: messageFromError(e) || 'Failed to load campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body.name || '').trim();
    let slug = String(body.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    if (!slug) {
      slug = slugFromName(name);
    }

    const row: Record<string, unknown> = {
      name,
      slug,
      is_active: body.is_active !== false,
    };

    if ('client_id' in body) {
      row.client_id =
        body.client_id === null || body.client_id === '' || body.client_id === undefined
          ? null
          : Number(body.client_id);
    }
    if ('notes' in body) row.notes = body.notes == null || body.notes === '' ? null : String(body.notes);
    if ('campaign_start_date' in body)
      row.campaign_start_date = body.campaign_start_date || null;
    if ('campaign_end_date' in body) row.campaign_end_date = body.campaign_end_date || null;
    if ('campaign_start_time' in body)
      row.campaign_start_time = body.campaign_start_time || null;
    if ('campaign_end_time' in body) row.campaign_end_time = body.campaign_end_time || null;
    if ('start_include_time' in body) row.start_include_time = Boolean(body.start_include_time);
    if ('end_include_time' in body) row.end_include_time = Boolean(body.end_include_time);

    const inserted = await sc.from('hs_marketing_campaigns').insert(row).select('*').single();
    if (inserted.error) throw inserted.error;
    return NextResponse.json({ success: true, data: inserted.data });
  } catch (e) {
    console.error('[hotspot/campaigns POST]', e);
    const msg = messageFromError(e);
    const code = e && typeof e === 'object' && 'code' in e ? String((e as PostgrestError).code) : '';
    const status = code === '23505' ? 409 : 500;
    const friendly =
      code === '23505'
        ? 'Kampanja s tim nazivom/slugom već postoji (jedinstven slug).'
        : msg || 'Failed to create campaign';
    return NextResponse.json({ success: false, error: friendly }, { status });
  }
}
