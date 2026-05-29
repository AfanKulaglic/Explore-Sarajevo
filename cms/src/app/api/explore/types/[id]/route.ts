import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as typesModel from '@/lib/db/models/explore/types';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET /api/explore/types/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const type = await typesModel.getTypeById(Number(id));
    
    if (!type) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 });
    }
    
    revalidateEntity('type');
    return NextResponse.json(type);
  } catch (error) {
    console.error('Error fetching type:', error);
    return NextResponse.json({ error: 'Failed to fetch type' }, { status: 500 });
  }
}

// PUT /api/types/[id]
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
    
    const existingType = await typesModel.getTypeById(Number(id));
    const type = await typesModel.updateType(Number(id), body);
    
    if (!type) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 });
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'update',
      entityType: 'type',
      entityId: Number(id),
      entityName: type.name,
      metadata: { previousName: existingType?.name, updatedFields: Object.keys(body) }
    });
    
    revalidateEntity('type');
    return NextResponse.json(type);
  } catch (error) {
    console.error('Error updating type:', error);
    return NextResponse.json({ error: 'Failed to update type' }, { status: 500 });
  }
}

// DELETE /api/types/[id]
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
    const existingType = await typesModel.getTypeById(Number(id));
    const deleted = await typesModel.deleteType(Number(id));
    
    if (!deleted) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 });
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'delete',
      entityType: 'type',
      entityId: Number(id),
      entityName: existingType?.name || 'Unknown',
    });
    
    revalidateEntity('type');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting type:', error);
    return NextResponse.json({ error: 'Failed to delete type' }, { status: 500 });
  }
}
