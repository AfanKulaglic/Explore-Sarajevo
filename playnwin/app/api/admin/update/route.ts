import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { table, data, match, adminEmail } = body

    console.log('Admin update request:', { table, data, match, adminEmail: adminEmail?.substring(0, 5) + '...' })

    // Verify admin email
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Allowed tables for admin updates
    const allowedTables = [
      'memory_config', 'memory_cards',
      'puzzle_config', 'puzzle_images', 'puzzle_reward_tiers',
      'wordsearch_config', 'wordsearch_words', 'wordsearch_reward_tiers',
      'pacman_config',
      'wheel_prizes',
      'game_settings'
    ]

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ success: false, error: 'Table not allowed' }, { status: 400 })
    }

    const client = getServiceClient()
    if (!client) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 })
    }
    const supabase = client.schema('gamelauncher');

    // Build the query with .eq() for each match condition
    let query = supabase.from(table).update(data)
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value)
    }
    
    const { data: result, error } = await query.select()

    console.log('Admin update result:', { result, error, rowsAffected: result?.length || 0 })

    if (error) {
      console.error('Admin update error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
