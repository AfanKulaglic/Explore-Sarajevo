import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as sectionsModel from '@/lib/db/models/explore/sections';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// PUT /api/explore/sections/reorder - Reorder sections
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { sections } = body;
    
    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: 'Sections array is required' }, { status: 400 });
    }
    
    await sectionsModel.reorderSections(sections);
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'reorder',
      entityType: 'section',
      entityId: 0,
      entityName: `${sections.length} sections`,
      metadata: { sectionIds: sections.map((s: { id: number }) => s.id) }
    });
    
    revalidateEntity('section');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 });
  }
}
