import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT /api/hotspot/block-items/reorder
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { blockSetId, itemIds } = body;

    if (!blockSetId || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { success: false, error: 'blockSetId and itemIds are required' },
        { status: 400 }
      );
    }

    const items = await supabaseHotspotModel.reorderBlockItems(blockSetId, itemIds);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error reordering block items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder block items' },
      { status: 500 }
    );
  }
}
