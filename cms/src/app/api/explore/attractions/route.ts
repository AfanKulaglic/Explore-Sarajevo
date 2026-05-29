import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as attractionsModel from '@/lib/db/models/explore/attractions';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET /api/explore/attractions - Get all attractions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      section_id: searchParams.get('section_id') ? Number(searchParams.get('section_id')) : undefined,
      featured: searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined
    };
    
    const attractions = await attractionsModel.getAllAttractions(filters);
    return NextResponse.json(attractions);
  } catch (error) {
    console.error('Error fetching attractions:', error);
    return NextResponse.json({ error: 'Failed to fetch attractions' }, { status: 500 });
  }
}

// POST /api/explore/attractions - Create a new attraction
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      name,
      slug,
      description,
      address,
      location,
      opening_hours,
      media,
      featured_location,
      category_ids,
      type_ids,
      section_ids,
      display_order,
      // English translations
      name_en,
      description_en,
      address_en,
      price_info_en,
      opening_hours_en
    } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const attraction = await attractionsModel.createAttraction({
      name,
      slug,
      description,
      address,
      location,
      opening_hours,
      media,
      featured_location,
      category_ids,
      type_ids,
      section_ids,
      display_order,
      name_en,
      description_en,
      address_en,
      price_info_en,
      opening_hours_en
    });
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'create',
      entityType: 'attraction',
      entityId: attraction.id,
      entityName: attraction.name,
    });
    
    revalidateEntity('attraction');
    return NextResponse.json(attraction, { status: 201 });
  } catch (error) {
    console.error('Error creating attraction:', error);
    return NextResponse.json({ error: 'Failed to create attraction' }, { status: 500 });
  }
}
