import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as attractionsModel from '@/lib/db/models/explore/attractions';
import { verifyAuth } from '@/lib/auth';

// PUT /api/attractions/reorder - Reorder attractions
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { attractions } = body;
    
    if (!attractions || !Array.isArray(attractions)) {
      return NextResponse.json({ error: 'Attractions array is required' }, { status: 400 });
    }
    
    await attractionsModel.reorderAttractions(attractions);
    
    revalidateEntity('attraction');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering attractions:', error);
    return NextResponse.json({ error: 'Failed to reorder attractions' }, { status: 500 });
  }
}
