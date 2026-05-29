import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Set a cookie that the middleware can read
  // Using httpOnly: false so it's immediately available
  response.cookies.set('temp_auth', 'true', {
    httpOnly: false,
    secure: false, // Allow in development
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  
  return response
}
