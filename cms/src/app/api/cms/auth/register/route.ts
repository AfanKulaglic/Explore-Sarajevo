import { NextRequest, NextResponse } from 'next/server';
import * as usersModel from '@/lib/db/models/users';
import { signToken, createAuthCookieHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;
    
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    
    const user = await usersModel.register(username, email, password);
    if (!user) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
    }
    
    const token = signToken(user as { id: number; username: string; email: string; role: string });
    
    const response = NextResponse.json({ user }, { status: 201 });
    response.headers.set('Set-Cookie', createAuthCookieHeader(token));
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
