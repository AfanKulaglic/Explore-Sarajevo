import { NextResponse } from 'next/server';
import * as collectionsModel from '@/lib/db/models/pametno/collections';

// GET /api/pametno/public/collections - Get all collections for public
export async function GET() {
  try {
    const collections = await collectionsModel.getAllCollections();
    
    // Filter only active collections
    const activeCollections = collections.filter((c: { is_active?: boolean }) => c.is_active !== false);
    
    return NextResponse.json(activeCollections);
  } catch (error) {
    console.error('Error fetching public collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
