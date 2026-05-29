import { NextRequest, NextResponse } from 'next/server'

// Read admin emails at runtime (server-side)
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Verify if an email has admin access
 * POST /api/admin/verify
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, isAdmin: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const adminEmails = getAdminEmails()
    const isAdmin = adminEmails.includes(email.toLowerCase())

    return NextResponse.json({
      success: true,
      isAdmin
    })
  } catch (error) {
    console.error('Admin verify error:', error)
    return NextResponse.json(
      { success: false, isAdmin: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
