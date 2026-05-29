import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as productsModel from '@/lib/db/models/pametno/products';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET /api/pametno/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productsModel.getProductById(Number(id));
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    revalidateEntity('product');
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/pametno/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    
    const existingProduct = await productsModel.getProductById(Number(id));
    const product = await productsModel.updateProduct(Number(id), body);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'update',
      entityType: 'product',
      entityId: Number(id),
      entityName: product.name,
      metadata: {
        previousName: existingProduct?.name,
        updatedFields: Object.keys(body)
      }
    });
    
    revalidateEntity('product');
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/pametno/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const existingProduct = await productsModel.getProductById(Number(id));
    const deleted = await productsModel.deleteProduct(Number(id));
    
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'delete',
      entityType: 'product',
      entityId: Number(id),
      entityName: existingProduct?.name || 'Unknown',
    });
    
    revalidateEntity('product');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
