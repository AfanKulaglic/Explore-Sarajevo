import { NextRequest, NextResponse } from 'next/server';
import { sc } from '@/lib/db/supabase';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Special endpoint to reset password for users with SHA256-hashed passwords
// POST /api/auth/reset-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, new_password, admin_key } = body;

    // Use the same JWT secret used for auth
    const expectedKey = process.env.SESSION_JWT_SECRET;
    
    if (!expectedKey || admin_key !== expectedKey) {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 403 }
      );
    }

    if (!email || !new_password) {
      return NextResponse.json(
        { error: 'Email and new_password are required' },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error: findError } = await sc
      .from('cms_users')
      .select('id, email, username')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash the new password with bcrypt
    const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);

    // Update the user's password
    const { error: updateError } = await sc
      .from('cms_users')
      .update({ 
        password_hash,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Error in password reset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
