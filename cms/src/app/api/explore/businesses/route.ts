import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as businessesModel from '@/lib/db/models/explore/businesses';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET /api/explore/businesses - Get all businesses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      section_id: searchParams.get('section_id') ? Number(searchParams.get('section_id')) : undefined,
    };
    
    const businesses = await businessesModel.getAllBusinesses(filters);
    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}

// POST /api/explore/businesses - Create a new business
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
      telephone,
      email,
      website,
      working_hours,
      price_range,
      media,
      rating,
      brand_id,
      category_ids,
      type_ids,
      section_ids,
      category_relationships,
      section_relationships,
      display_order,
      name_en,
      description_en,
      address_en,
      price_range_en
    } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const business = await businessesModel.createBusiness({
      name,
      slug,
      description,
      address,
      location,
      telephone,
      email,
      website,
      working_hours,
      price_range,
      media,
      rating,
      brand_id,
      category_ids,
      type_ids,
      section_ids,
      category_relationships,
      section_relationships,
      display_order,
      name_en,
      description_en,
      address_en,
      price_range_en
    });
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'create',
      entityType: 'business',
      entityId: business.id,
      entityName: business.name,
    });
    
    revalidateEntity('business');
    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 });
  }
}
