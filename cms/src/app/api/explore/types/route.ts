import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as typesModel from '@/lib/db/models/explore/types';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET /api/explore/types - Get all types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined
    };
    
    const types = await typesModel.getAllTypes(filters);
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching types:', error);
    return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 });
  }
}

// POST /api/types - Create a new type
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, description, icon, image, category_id, slug, name_en, description_en } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const type = await typesModel.createType({
      name,
      description,
      icon,
      image,
      category_id,
      slug,
      name_en,
      description_en
    });
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'create',
      entityType: 'type',
      entityId: type.id,
      entityName: type.name,
    });
    
    revalidateEntity('type');
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error('Error creating type:', error);
    return NextResponse.json({ error: 'Failed to create type' }, { status: 500 });
  }
}
