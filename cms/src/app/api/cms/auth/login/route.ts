import { NextRequest, NextResponse } from 'next/server';
import * as usersModel from '@/lib/db/models/users';
import { signToken, createAuthCookieHeader } from '@/lib/auth';
import { logLogin } from '@/lib/server-activity-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    
    const user = await usersModel.login(username, password);
    const token = signToken(user as { id: number; username: string; email: string; role: string });
    
    // Log successful login with device tracking
    await logLogin(request, String(user.id), user.email);
    
    const response = NextResponse.json({ user });
    response.headers.set('Set-Cookie', createAuthCookieHeader(token));
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid credentials';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
