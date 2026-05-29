import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/navigation-chips
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const chips = await supabaseHotspotModel.getNavigationChips();
    return NextResponse.json({ success: true, data: chips });
  } catch (error) {
    console.error('Error fetching navigation chips:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation chips' },
      { status: 500 }
    );
  }
}

// POST /api/hotspot/navigation-chips
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const chip = await supabaseHotspotModel.createNavigationChip(body);
    return NextResponse.json({ success: true, data: chip });
  } catch (error) {
    console.error('Error creating navigation chip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create navigation chip' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/navigation-chips
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
        { success: false, error: 'Chip ID required' },
        { status: 400 }
      );
    }

    const chip = await supabaseHotspotModel.updateNavigationChip(id, updates);
    return NextResponse.json({ success: true, data: chip });
  } catch (error) {
    console.error('Error updating navigation chip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update navigation chip' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotspot/navigation-chips
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
        { success: false, error: 'Chip ID required' },
        { status: 400 }
      );
    }

    await supabaseHotspotModel.deleteNavigationChip(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting navigation chip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete navigation chip' },
      { status: 500 }
    );
  }
}
