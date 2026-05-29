import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as subeventsModel from '@/lib/db/models/explore/subevents';
import { verifyAuth } from '@/lib/auth';

// GET /api/subevents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subevent = await subeventsModel.getSubEventById(Number(id));
    
    if (!subevent) {
      return NextResponse.json({ error: 'Subevent not found' }, { status: 404 });
    }
    
    revalidateEntity('subevent');
    return NextResponse.json(subevent);
  } catch (error) {
    console.error('Error fetching subevent:', error);
    return NextResponse.json({ error: 'Failed to fetch subevent' }, { status: 500 });
  }
}

// PUT /api/subevents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    
    const subevent = await subeventsModel.updateSubEvent(Number(id), body);
    
    if (!subevent) {
      return NextResponse.json({ error: 'Subevent not found' }, { status: 404 });
    }
    
    revalidateEntity('subevent');
    return NextResponse.json(subevent);
  } catch (error) {
    console.error('Error updating subevent:', error);
    return NextResponse.json({ error: 'Failed to update subevent' }, { status: 500 });
  }
}

// DELETE /api/subevents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const deleted = await subeventsModel.deleteSubEvent(Number(id));
    
    if (!deleted) {
      return NextResponse.json({ error: 'Subevent not found' }, { status: 404 });
    }
    
    revalidateEntity('subevent');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subevent:', error);
    return NextResponse.json({ error: 'Failed to delete subevent' }, { status: 500 });
  }
}
