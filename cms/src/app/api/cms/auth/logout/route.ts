import { NextRequest, NextResponse } from 'next/server';
import { createClearAuthCookieHeader, verifyAuth } from '@/lib/auth';
import { logLogout } from '@/lib/server-activity-logger';

export async function POST(request: NextRequest) {
  // Try to get user info before clearing session for logging
  try {
    const user = await verifyAuth(request);
    if (user) {
      await logLogout(request, String(user.id), user.email);
    }
  } catch {
    // Ignore errors - user might already be logged out
  }
  
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', createClearAuthCookieHeader());
  return response;
}
