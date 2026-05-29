import { NextRequest, NextResponse } from 'next/server';
import { hotspotModel } from '@/lib/db/models/hotspot/hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/hotspot - Get full hotspot config (legacy JSON aggregate)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await hotspotModel.getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching hotspot config:', error);
    return NextResponse.json({ error: 'Failed to fetch hotspot config' }, { status: 500 });
  }
}

// PUT /api/hotspot - Update full hotspot config
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    await hotspotModel.saveConfig(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating hotspot config:', error);
    return NextResponse.json({ error: 'Failed to update hotspot config' }, { status: 500 });
  }
}
