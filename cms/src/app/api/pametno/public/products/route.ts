import { NextRequest, NextResponse } from 'next/server';
import * as productsModel from '@/lib/db/models/pametno/products';

// GET /api/pametno/public/products - Get all products for public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
      brand_id: searchParams.get('brand_id') ? Number(searchParams.get('brand_id')) : undefined,
      collection_id: searchParams.get('collection_id') ? Number(searchParams.get('collection_id')) : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined
    };
    
    const products = await productsModel.getAllProducts(filters);
    
    // Filter only published products (is_published = true)
    const publishedProducts = products.filter((p: { is_published?: boolean }) => p.is_published === true);
    
    return NextResponse.json(publishedProducts);
  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
