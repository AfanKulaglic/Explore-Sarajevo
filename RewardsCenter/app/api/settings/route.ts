import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export interface UserSettings {
  account_id: string
  profile_visibility: 'everyone' | 'friends' | 'private'
  activity_status: boolean
  show_on_leaderboard: boolean
  created_at?: string
  updated_at?: string
}

const DEFAULT_SETTINGS: Omit<UserSettings, 'account_id'> = {
  profile_visibility: 'everyone',
  activity_status: true,
  show_on_leaderboard: true,
}

/**
 * GET /api/settings - Get user settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 })
    }

    // Try to get existing settings
    const { data: settings, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('account_id', accountId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for new users
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Return existing settings or defaults
    return NextResponse.json({
      data: settings || { account_id: accountId, ...DEFAULT_SETTINGS }
    })
  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/settings - Update user settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { account_id, ...updates } = body

    if (!account_id) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 })
    }

    // Validate the updates
    const validFields = ['profile_visibility', 'activity_status', 'show_on_leaderboard']
    const filteredUpdates: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(updates)) {
      if (validFields.includes(key)) {
        if (key === 'profile_visibility') {
          if (!['everyone', 'friends', 'private'].includes(value as string)) {
            return NextResponse.json({ error: 'Invalid profile_visibility value' }, { status: 400 })
          }
        }
        if (key === 'activity_status' || key === 'show_on_leaderboard') {
          if (typeof value !== 'boolean') {
            return NextResponse.json({ error: `${key} must be a boolean` }, { status: 400 })
          }
        }
        filteredUpdates[key] = value
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Upsert the settings (insert or update)
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        account_id,
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'account_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
