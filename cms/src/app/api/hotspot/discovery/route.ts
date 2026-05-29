import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  getDiscoveryPlaces,
  createDiscoveryPlace,
  updateDiscoveryPlace,
  deleteDiscoveryPlace,
} from '@/lib/db/models/hotspot/supabase-hotspot';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const items = await getDiscoveryPlaces();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[API] GET discovery error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch discovery places' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const item = await createDiscoveryPlace(body);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('[API] POST discovery error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create discovery place' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { id, ...updates } = body;
    const item = await updateDiscoveryPlace(id, updates);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('[API] PUT discovery error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update discovery place' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0', 10);
    await deleteDiscoveryPlace(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE discovery error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete discovery place' }, { status: 500 });
  }
}
