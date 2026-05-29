import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/block-sets
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const blockSets = await supabaseHotspotModel.getBlockSets();
    return NextResponse.json(
      { success: true, data: blockSets },
      {
        headers: {
          'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching block sets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch block sets' },
      { status: 500 }
    );
  }
}

// POST /api/hotspot/block-sets
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const blockSet = await supabaseHotspotModel.createBlockSet(body);
    return NextResponse.json({ success: true, data: blockSet });
  } catch (error) {
    console.error('Error creating block set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create block set' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/block-sets
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
        { success: false, error: 'Block Set ID required' },
        { status: 400 }
      );
    }

    const blockSet = await supabaseHotspotModel.updateBlockSet(id, updates);
    return NextResponse.json({ success: true, data: blockSet });
  } catch (error) {
    console.error('Error updating block set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update block set' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotspot/block-sets
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
        { success: false, error: 'Block Set ID required' },
        { status: 400 }
      );
    }

    await supabaseHotspotModel.deleteBlockSet(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting block set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete block set' },
      { status: 500 }
    );
  }
}
