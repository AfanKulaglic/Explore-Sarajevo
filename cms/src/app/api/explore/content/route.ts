import { NextResponse } from 'next/server';
import * as businessesModel from '@/lib/db/models/explore/businesses';
import * as attractionsModel from '@/lib/db/models/explore/attractions';
import * as eventsModel from '@/lib/db/models/explore/events';

// GET /api/content - Legacy endpoint for backward compatibility
export async function GET() {
  try {
    const [businesses, attractions, events] = await Promise.all([
      businessesModel.getAllBusinesses({}),
      attractionsModel.getAllAttractions({}),
      eventsModel.getAllEvents({})
    ]);
    
    return NextResponse.json({
      businesses,
      attractions,
      events
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
