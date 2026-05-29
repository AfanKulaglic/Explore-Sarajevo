import { NextRequest, NextResponse } from 'next/server'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'

/**
 * POST /api/auth/logout - Logout user
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (authHeader) {
      // Try to logout from central system
      try {
        await fetch(`${CENTRAL_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader
          }
        })
      } catch (e) {
        // Ignore errors - we'll clear local session anyway
        console.log('Central logout failed, continuing with local logout')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    // Return success anyway - client will clear local storage
    return NextResponse.json({ success: true })
  }
}
