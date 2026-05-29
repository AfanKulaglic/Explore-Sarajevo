import { NextRequest, NextResponse } from 'next/server'
import { updateAccountAvatar } from '@/lib/central-account'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'

export async function POST(request: NextRequest) {
  try {
    const { avatarUrl, avatarConfig, email } = await request.json()

    if (!avatarUrl) {
      return NextResponse.json({ error: 'Avatar URL is required' }, { status: 400 })
    }

    // If email is provided, use admin API to update avatar in central system
    if (email) {
      const result = await updateAccountAvatar(email, avatarUrl, avatarConfig)
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Avatar updated in central system',
          avatarUrl 
        })
      }
      
      // Log error but still return success - avatar is saved client-side
      console.error('Central avatar update failed:', result.error)
    }

    // Return success anyway - avatar is saved client-side in localStorage
    return NextResponse.json({ 
      success: true, 
      message: 'Avatar saved locally. Central sync may be pending.',
      avatarUrl 
    })
  } catch (error) {
    console.error('Error updating avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get current avatar config from Account System
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/me`, {
      headers: {
        'Authorization': authHeader,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to get avatar' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({
      avatarUrl: data.account?.avatar_url ?? null,
    })
  } catch (error) {
    console.error('Error getting avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
