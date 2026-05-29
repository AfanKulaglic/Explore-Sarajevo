import { NextRequest, NextResponse } from 'next/server'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'

/**
 * Admin session refresh - proxies to central auth
 */
export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json()

    if (!refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Call central auth refresh
    const response = await fetch(`${CENTRAL_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || 'Session refresh failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      session: data.session,
      user: {
        id: data.account?.id || data.user?.id,
        email: data.account?.email || data.user?.email,
        name: data.account?.name || data.user?.name,
      }
    })
  } catch (error) {
    console.error('Admin refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh session' },
      { status: 500 }
    )
  }
}
