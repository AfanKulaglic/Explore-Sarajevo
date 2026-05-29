import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/news-cards
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const cards = await supabaseHotspotModel.getNewsCards();
    return NextResponse.json({ success: true, data: cards });
  } catch (error) {
    console.error('Error fetching news cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news cards' },
      { status: 500 }
    );
  }
}

// POST /api/hotspot/news-cards
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const card = await supabaseHotspotModel.createNewsCard(body);
    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error('Error creating news card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create news card' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/news-cards
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
        { success: false, error: 'Card ID required' },
        { status: 400 }
      );
    }

    const card = await supabaseHotspotModel.updateNewsCard(id, updates);
    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error('Error updating news card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update news card' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotspot/news-cards
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
        { success: false, error: 'Card ID required' },
        { status: 400 }
      );
    }

    await supabaseHotspotModel.deleteNewsCard(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete news card' },
      { status: 500 }
    );
  }
}
