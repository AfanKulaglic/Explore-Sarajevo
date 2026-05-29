import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { hotspotModel } from '@/lib/db/models/hotspot/hotspot';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/play-n-win — legacy JSON config slice (prefer /api/hotspot/play-and-win + Supabase)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await hotspotModel.getConfig();
    return NextResponse.json(config.playAndWin || {});
  } catch (error) {
    console.error('Error fetching play-n-win config:', error);
    return NextResponse.json({ error: 'Failed to fetch play-n-win config' }, { status: 500 });
  }
}
