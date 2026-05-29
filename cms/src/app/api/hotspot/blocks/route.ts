import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { hotspotModel } from '@/lib/db/models/hotspot/hotspot';

export const dynamic = 'force-dynamic';

/** Legacy JSON block sets — prefer GET /api/hotspot/block-sets (Supabase). */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await hotspotModel.getConfig();
    return NextResponse.json(config.blockSets || []);
  } catch (error) {
    console.error('Error fetching hotspot blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch hotspot blocks' }, { status: 500 });
  }
}
