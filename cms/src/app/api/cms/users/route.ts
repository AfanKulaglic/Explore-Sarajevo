import { NextRequest, NextResponse } from 'next/server';
import { sc } from '@/lib/db/supabase';
import bcrypt from 'bcrypt';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

const SALT_ROUNDS = 10;

// GET - Fetch all users (for owner/admin)
export async function GET() {
  try {
    const { data: users, error } = await sc
      .from('cms_users')
      .select('id, email, username, role, phone, avatar_url, assigned_sections, last_login, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Map username to name for frontend consistency
    const mappedUsers = users?.map(user => ({
      ...user,
      name: user.username, // Map username to name for frontend
    }));

    return NextResponse.json(mappedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { email, name, username, password, role, phone, assigned_sections } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const { data: existingUser } = await sc
      .from('cms_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (same as login system)
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Use name field for username (display name), fallback to email
    const displayName = name || username || email.split('@')[0];

    const { data: user, error } = await sc
      .from('cms_users')
      .insert({
        email: email.toLowerCase().trim(),
        username: displayName,
        password_hash,
        role: role || 'employee',
        phone: phone || null,
        assigned_sections: assigned_sections || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(authUser.id),
      userEmail: authUser.email,
      action: 'create',
      entityType: 'user',
      entityId: user.id,
      entityName: user.email,
      metadata: { role: user.role }
    });

    return NextResponse.json({ ...user, name: user.username }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
