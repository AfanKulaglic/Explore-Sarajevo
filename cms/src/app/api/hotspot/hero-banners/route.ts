import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/hero-banners
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const banners = await supabaseHotspotModel.getHeroBanners();
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero banners' },
      { status: 500 }
    );
  }
}

// POST /api/hotspot/hero-banners
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const banner = await supabaseHotspotModel.createHeroBanner(body);
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error('Error creating hero banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hero banner' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/hero-banners
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
        { success: false, error: 'Banner ID required' },
        { status: 400 }
      );
    }

    const banner = await supabaseHotspotModel.updateHeroBanner(id, updates);
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error('Error updating hero banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hero banner' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotspot/hero-banners
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
        { success: false, error: 'Banner ID required' },
        { status: 400 }
      );
    }

    await supabaseHotspotModel.deleteHeroBanner(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero banner' },
      { status: 500 }
    );
  }
}
