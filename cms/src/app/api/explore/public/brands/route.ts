import { NextResponse } from 'next/server';
import * as brandsModel from '@/lib/db/models/explore/brands';

export async function GET() {
  try {
    const brands = await brandsModel.getAllBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching public brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
