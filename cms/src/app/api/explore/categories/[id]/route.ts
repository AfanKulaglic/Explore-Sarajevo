import { NextRequest, NextResponse } from 'next/server';
import { revalidateEntity } from '@/lib/revalidate';
import * as categoriesModel from '@/lib/db/models/explore/categories';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET /api/explore/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await categoriesModel.getCategoryById(Number(id));
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    revalidateEntity('category');
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PUT /api/categories/[id]
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
    
    const existingCategory = await categoriesModel.getCategoryById(Number(id));
    const category = await categoriesModel.updateCategory(Number(id), body);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'update',
      entityType: 'category',
      entityId: Number(id),
      entityName: category.name,
      metadata: { previousName: existingCategory?.name, updatedFields: Object.keys(body) }
    });
    
    revalidateEntity('category');
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
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
    const existingCategory = await categoriesModel.getCategoryById(Number(id));
    const deleted = await categoriesModel.deleteCategory(Number(id));
    
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'delete',
      entityType: 'category',
      entityId: Number(id),
      entityName: existingCategory?.name || 'Unknown',
    });
    
    revalidateEntity('category');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
