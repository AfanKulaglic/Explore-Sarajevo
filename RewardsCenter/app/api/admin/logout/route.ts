import { NextRequest, NextResponse } from 'next/server'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'

/**
 * Admin logout - proxies to central auth
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (authHeader) {
      // Call central auth logout
      await fetch(`${CENTRAL_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader
        }
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json({ success: true }) // Always return success for logout
  }
}
