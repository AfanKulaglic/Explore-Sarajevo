import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as businessesModel from '@/lib/db/models/explore/businesses';
import { verifyAuth } from '@/lib/auth';

// PUT /api/businesses/reorder - Reorder businesses
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { businesses } = body;
    
    if (!businesses || !Array.isArray(businesses)) {
      return NextResponse.json({ error: 'Businesses array is required' }, { status: 400 });
    }
    
    await businessesModel.reorderBusinesses(businesses);
    
    revalidateEntity('business');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering businesses:', error);
    return NextResponse.json({ error: 'Failed to reorder businesses' }, { status: 500 });
  }
}
