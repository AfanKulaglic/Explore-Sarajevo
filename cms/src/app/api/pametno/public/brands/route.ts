import { NextResponse } from 'next/server';
import * as brandsModel from '@/lib/db/models/pametno/brands';

// GET /api/pametno/public/brands - Get all brands for public
export async function GET() {
  try {
    const brands = await brandsModel.getAllBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching public brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
