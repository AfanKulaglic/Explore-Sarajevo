import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as attractionsModel from '@/lib/db/models/explore/attractions';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET /api/explore/attractions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attraction = await attractionsModel.getAttractionById(Number(id));
    
    if (!attraction) {
      return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
    }
    
    revalidateEntity('attraction');
    return NextResponse.json(attraction);
  } catch (error) {
    console.error('Error fetching attraction:', error);
    return NextResponse.json({ error: 'Failed to fetch attraction' }, { status: 500 });
  }
}

// PUT /api/explore/attractions/[id]
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
    
    const existingAttraction = await attractionsModel.getAttractionById(Number(id));
    const attraction = await attractionsModel.updateAttraction(Number(id), body);
    
    if (!attraction) {
      return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'update',
      entityType: 'attraction',
      entityId: Number(id),
      entityName: attraction.name,
      metadata: {
        previousName: existingAttraction?.name,
        updatedFields: Object.keys(body)
      }
    });
    
    revalidateEntity('attraction');
    return NextResponse.json(attraction);
  } catch (error) {
    console.error('Error updating attraction:', error);
    return NextResponse.json({ error: 'Failed to update attraction' }, { status: 500 });
  }
}

// DELETE /api/explore/attractions/[id]
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
    const existingAttraction = await attractionsModel.getAttractionById(Number(id));
    const deleted = await attractionsModel.deleteAttraction(Number(id));
    
    if (!deleted) {
      return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'delete',
      entityType: 'attraction',
      entityId: Number(id),
      entityName: existingAttraction?.name || 'Unknown',
    });
    
    revalidateEntity('attraction');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attraction:', error);
    return NextResponse.json({ error: 'Failed to delete attraction' }, { status: 500 });
  }
}
