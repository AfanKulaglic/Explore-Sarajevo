import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/play-n-win/supabase - Legacy route, use /api/hotspot/play-and-win instead
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const items = await supabaseHotspotModel.getPlayAndWin();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching play and win:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch play and win' },
      { status: 500 }
    );
  }
}

// POST /api/hotspot/play-n-win/supabase
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const item = await supabaseHotspotModel.createPlayAndWin(body);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error creating play and win:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create play and win' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/play-n-win/supabase
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
        { success: false, error: 'Play and Win ID required' },
        { status: 400 }
      );
    }

    const item = await supabaseHotspotModel.updatePlayAndWin(id, updates);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating play and win:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update play and win' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotspot/play-n-win/supabase
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
        { success: false, error: 'Play and Win ID required' },
        { status: 400 }
      );
    }

    await supabaseHotspotModel.deletePlayAndWin(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting play and win:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete play and win' },
      { status: 500 }
    );
  }
}
