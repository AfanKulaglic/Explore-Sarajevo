import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  getPlayAndWin, 
  createPlayAndWin, 
  updatePlayAndWin, 
  deletePlayAndWin 
} from '@/lib/db/models/hotspot/supabase-hotspot';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/play-and-win - Get all Play and Win items
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const data = await getPlayAndWin();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching Play and Win items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Play and Win items' },
      { status: 500 }
    );
  }
}

// POST /api/hotspot/play-and-win - Create a new Play and Win item
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = await createPlayAndWin(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating Play and Win item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Play and Win item' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/play-and-win - Update a Play and Win item
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing item ID' },
        { status: 400 }
      );
    }
    const data = await updatePlayAndWin(id, updates);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating Play and Win item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update Play and Win item' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotspot/play-and-win - Delete a Play and Win item
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing item ID' },
        { status: 400 }
      );
    }
    await deletePlayAndWin(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Play and Win item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete Play and Win item' },
      { status: 500 }
    );
  }
}
