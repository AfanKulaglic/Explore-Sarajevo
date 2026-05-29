import { NextRequest, NextResponse } from 'next/server';
import * as subeventsModel from '@/lib/db/models/explore/subevents';
import * as eventsModel from '@/lib/db/models/explore/events';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    
    const subevents = await subeventsModel.getAllSubEvents(eventId ? Number(eventId) : null);
    const events = await eventsModel.getAllEvents({});
    
    // Add event info to each subevent
    const subeventsWithEvent = subevents.map((se: Record<string, unknown>) => {
      const event = events.find((e: { id: number }) => e.id === se.event_id);
      return {
        id: se.id,
        event_id: se.event_id,
        description: se.description,
        start_date: se.start_date,
        end_date: se.end_date,
        location: se.location,
        event_name: (event as { name?: string })?.name,
        event_slug: (event as { slug?: string })?.slug
      };
    });
    
    return NextResponse.json(subeventsWithEvent);
  } catch (error) {
    console.error('Error fetching public subevents:', error);
    return NextResponse.json({ error: 'Failed to fetch subevents' }, { status: 500 });
  }
}
