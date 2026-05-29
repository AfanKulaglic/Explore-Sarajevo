import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as productsModel from '@/lib/db/models/pametno/products';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET /api/pametno/products - Get all products (CMS)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
      brand_id: searchParams.get('brand_id') ? Number(searchParams.get('brand_id')) : undefined,
      collection_id: searchParams.get('collection_id') ? Number(searchParams.get('collection_id')) : undefined,
      featured: searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined
    };
    
    const products = await productsModel.getAllProducts(filters);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/pametno/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const product = await productsModel.createProduct(body);
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'create',
      entityType: 'product',
      entityId: product.id,
      entityName: product.name,
    });
    
    revalidateEntity('product');
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
