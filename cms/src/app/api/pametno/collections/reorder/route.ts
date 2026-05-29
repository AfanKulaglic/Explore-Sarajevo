import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as collectionsModel from '@/lib/db/models/pametno/collections';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// PUT /api/pametno/collections/reorder - Reorder collections
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { collections } = body;
    
    if (!collections || !Array.isArray(collections)) {
      return NextResponse.json({ error: 'Collections array is required' }, { status: 400 });
    }
    
    await collectionsModel.reorderCollections(collections);
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'reorder',
      entityType: 'collection',
      entityId: 0,
      entityName: `${collections.length} collections`,
      metadata: { collectionIds: collections.map((c: { id: number }) => c.id) }
    });
    
    revalidateEntity('collection');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering collections:', error);
    return NextResponse.json({ error: 'Failed to reorder collections' }, { status: 500 });
  }
}
