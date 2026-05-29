import { NextRequest, NextResponse } from 'next/server'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'https://accounts.saraya.solutions'

/**
 * GET /api/auth/account
 * 
 * Fetches account info from the central auth system.
 * This proxies the request to accounts.saraya.solutions to avoid CORS issues.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Don't expose internal errors
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      account: data,
    })
  } catch (error) {
    console.error('[API /auth/account] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}
