import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  getEditorsPicks,
  createEditorsPick,
  updateEditorsPick,
  deleteEditorsPick,
} from '@/lib/db/models/hotspot/supabase-hotspot';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const items = await getEditorsPicks();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[API] GET editors-picks error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch editors picks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const item = await createEditorsPick(body);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('[API] POST editors-picks error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create editors pick' }, { status: 500 });
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
    const item = await updateEditorsPick(id, updates);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('[API] PUT editors-picks error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update editors pick' }, { status: 500 });
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
    await deleteEditorsPick(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE editors-picks error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete editors pick' }, { status: 500 });
  }
}
