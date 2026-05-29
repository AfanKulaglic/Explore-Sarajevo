import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { hotspotModel } from '@/lib/db/models/hotspot/hotspot';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/footer — legacy JSON footer slice (Supabase hotspot uses hs_site_config for portal)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await hotspotModel.getConfig();
    return NextResponse.json(config.footer || {});
  } catch (error) {
    console.error('Error fetching hotspot footer:', error);
    return NextResponse.json({ error: 'Failed to fetch hotspot footer' }, { status: 500 });
  }
}
