import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { hotspotModel } from '@/lib/db/models/hotspot/hotspot';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/utilities — legacy JSON utilities slice
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await hotspotModel.getConfig();
    return NextResponse.json(config.utilities || {});
  } catch (error) {
    console.error('Error fetching utilities config:', error);
    return NextResponse.json({ error: 'Failed to fetch utilities config' }, { status: 500 });
  }
}
