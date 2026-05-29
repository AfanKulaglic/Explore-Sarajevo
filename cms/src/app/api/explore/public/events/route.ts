import { NextResponse } from 'next/server';
import * as eventsModel from '@/lib/db/models/explore/events';
import * as subeventsModel from '@/lib/db/models/explore/subevents';

export async function GET() {
  try {
    const events = await eventsModel.getAllEvents({ status: 'active' });
    const allSubevents = await subeventsModel.getAllSubEvents(null);
    
    // Add subevents to each event - include English translations
    const eventsWithSubevents = events.map((e: Record<string, unknown>) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      location: e.location,
      start_date: e.start_date,
      end_date: e.end_date,
      image: e.image,
      categories: e.categories || [],
      subevents: allSubevents.filter((se: { event_id: number }) => se.event_id === e.id),
      // English translations
      name_en: e.name_en || null,
      description_en: e.description_en || null,
      price_info_en: e.price_info_en || null
    }));
    
    return NextResponse.json(eventsWithSubevents);
  } catch (error) {
    console.error('Error fetching public events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
