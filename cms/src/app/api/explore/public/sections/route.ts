import { NextResponse } from 'next/server';
import * as sectionsModel from '@/lib/db/models/explore/sections';

export async function GET() {
  try {
    const sections = await sectionsModel.getAllSections();
    
    // Filter for active sections only
    const activeSections = sections.filter((s: { is_active?: boolean }) => s.is_active !== false);
    
    return NextResponse.json(activeSections);
  } catch (error) {
    console.error('Error fetching public sections:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}
