import { NextRequest, NextResponse } from 'next/server'

const ACCOUNTS_URL = process.env.NEXT_PUBLIC_ACCOUNTS_URL || 'https://accounts.saraya.solutions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${ACCOUNTS_URL}/api/auth/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('SSO exchange proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to exchange SSO code' },
      { status: 500 }
    )
  }
}
