import { NextRequest, NextResponse } from 'next/server'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'https://accounts.saraya.solutions'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: 'Authorization header required' },
      { status: 401 }
    )
  }

  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        authorization: authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const payload = await response.json()
    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error('Central account lookup failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch account profile' },
      { status: 502 }
    )
  }
}
