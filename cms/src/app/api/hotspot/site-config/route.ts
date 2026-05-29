import { NextRequest, NextResponse } from 'next/server';
import { supabaseHotspotModel } from '@/lib/db/models/hotspot/supabase-hotspot';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/hotspot/site-config
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await supabaseHotspotModel.getSiteConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site config' },
      { status: 500 }
    );
  }
}

// PUT /api/hotspot/site-config
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const config = await supabaseHotspotModel.updateSiteConfig(body);
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating site config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update site config' },
      { status: 500 }
    );
  }
}
