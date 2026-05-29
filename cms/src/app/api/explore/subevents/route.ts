import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as subeventsModel from '@/lib/db/models/explore/subevents';
import { verifyAuth } from '@/lib/auth';

// GET /api/subevents - Get all subevents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    
    const subevents = await subeventsModel.getAllSubEvents(eventId ? Number(eventId) : null);
    return NextResponse.json(subevents);
  } catch (error) {
    console.error('Error fetching subevents:', error);
    return NextResponse.json({ error: 'Failed to fetch subevents' }, { status: 500 });
  }
}

// POST /api/subevents - Create a new subevent
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      event_id,
      description,
      start_date,
      end_date,
      location
    } = body;
    
    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    const subevent = await subeventsModel.createSubEvent({
      event_id,
      description,
      start_date,
      end_date,
      location
    });
    
    revalidateEntity('subevent');
    return NextResponse.json(subevent, { status: 201 });
  } catch (error) {
    console.error('Error creating subevent:', error);
    return NextResponse.json({ error: 'Failed to create subevent' }, { status: 500 });
  }
}
