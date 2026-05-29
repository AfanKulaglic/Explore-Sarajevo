import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/hero-videos
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const videos = await supabaseHotspotModel.getHeroVideos();
    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.error('Error fetching hero videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero videos' },
      { status: 500 }
    );
  }
}

// POST /api/hotspot/hero-videos - Create new video
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const video = await supabaseHotspotModel.createHeroVideo(body);
    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    console.error('Error creating hero video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hero video' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/hero-videos - Update video
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
        { success: false, error: 'Video ID required' },
        { status: 400 }
      );
    }

    const video = await supabaseHotspotModel.updateHeroVideo(id, updates);
    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    console.error('Error updating hero video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hero video' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotspot/hero-videos
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
        { success: false, error: 'Video ID required' },
        { status: 400 }
      );
    }

    await supabaseHotspotModel.deleteHeroVideo(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hero video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero video' },
      { status: 500 }
    );
  }
}
