import { NextRequest, NextResponse } from 'next/server'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'

// Read admin emails at runtime (server-side)
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Admin login - authenticates against Account-System
 * POST /api/admin/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if email is in admin whitelist (server-side check)
    const adminEmails = getAdminEmails()
    if (!adminEmails.includes(email.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'This account does not have admin access.' },
        { status: 403 }
      )
    }

    // Call central auth login - same as regular user login
    const response = await fetch(`${CENTRAL_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || 'Login failed' },
        { status: response.status || 401 }
      )
    }

    // Return session and user info with isAdmin flag
    return NextResponse.json({
      success: true,
      session: data.session,
      user: {
        id: data.account?.id || data.user?.id,
        email: data.account?.email || data.user?.email,
        name: data.account?.name || data.user?.name,
      },
      isAdmin: true
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect to authentication service' },
      { status: 500 }
    )
  }
}
