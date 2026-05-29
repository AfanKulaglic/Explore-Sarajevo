import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/hotspot/block-items
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const item = await supabaseHotspotModel.createBlockItem(body);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error creating block item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create block item' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/block-items
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Block Item ID required' },
        { status: 400 }
      );
    }

    const item = await supabaseHotspotModel.updateBlockItem(id, updates);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating block item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update block item' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotspot/block-items
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Block Item ID required' },
        { status: 400 }
      );
    }

    await supabaseHotspotModel.deleteBlockItem(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting block item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete block item' },
      { status: 500 }
    );
  }
}
