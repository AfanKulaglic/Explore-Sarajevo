import { NextResponse } from 'next/server';
import * as categoriesModel from '@/lib/db/models/pametno/categories';

// GET /api/pametno/public/categories - Get all categories for public
export async function GET() {
  try {
    const categories = await categoriesModel.getAllCategories();
    
    // Build tree structure with parent categories and children
    const rootCategories = categories.filter((c: { parent_id?: number | null }) => !c.parent_id);
    const categoriesWithChildren = rootCategories.map((cat: { id: number; name: string; slug: string; description?: string; image?: string }) => ({
      ...cat,
      subcategories: categories.filter((c: { parent_id?: number | null }) => c.parent_id === cat.id)
    }));
    
    return NextResponse.json(categoriesWithChildren);
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
