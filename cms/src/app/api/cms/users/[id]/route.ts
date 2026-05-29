import { NextRequest, NextResponse } from 'next/server';
import { sc } from '@/lib/db/supabase';
import bcrypt from 'bcrypt';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

const SALT_ROUNDS = 10;

// GET - Fetch single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: user, error } = await sc
      .from('cms_users')
      .select('id, email, username, role, phone, avatar_url, assigned_sections, last_login, created_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { email, name, username, password, role, phone, assigned_sections, avatar_url } = body;

    const updateData: Record<string, unknown> = {};

    if (email !== undefined) updateData.email = email;
    // Handle both 'name' and 'username' - they map to the same DB column
    if (name !== undefined) updateData.username = name;
    else if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (assigned_sections !== undefined) updateData.assigned_sections = assigned_sections;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    // Hash password with bcrypt if provided (same as login system)
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const { data: user, error } = await sc
      .from('cms_users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, username, role, phone, avatar_url, assigned_sections, last_login, created_at')
      .single();

    if (error) throw error;

    // Log activity
    await logActivityServer({
      request,
      userId: String(authUser.id),
      userEmail: authUser.email,
      action: 'update',
      entityType: 'user',
      entityId: Number(id),
      entityName: user.email,
      metadata: { updatedFields: Object.keys(body) }
    });

    // Map username to name for frontend
    return NextResponse.json({ ...user, name: user.username });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;

    // Check if trying to delete the owner
    const { data: user } = await sc
      .from('cms_users')
      .select('role, email')
      .eq('id', id)
      .single();

    if (user?.role === 'owner') {
      return NextResponse.json(
        { error: 'Ne možete obrisati vlasnika' },
        { status: 403 }
      );
    }

    const { error } = await sc
      .from('cms_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(authUser.id),
      userEmail: authUser.email,
      action: 'delete',
      entityType: 'user',
      entityId: Number(id),
      entityName: user?.email || 'Unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
