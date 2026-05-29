import { NextResponse } from 'next/server';
import * as productsModel from '@/lib/db/models/pametno/products';

// GET /api/pametno/public/featured - Get featured products for public
export async function GET() {
  try {
    const products = await productsModel.getAllProducts({ featured: true });
    
    // Filter only published featured products
    const featuredProducts = products.filter((p: { status?: string }) => p.status === 'published');
    
    return NextResponse.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
  }
}
