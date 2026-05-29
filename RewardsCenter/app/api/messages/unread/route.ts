import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/messages/unread - Get unread message count for a user
 * Uses conversation-based model: counts messages where read_at is null
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Get all conversations this user is part of
    const { data: participations, error: partError } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('account_id', userId)

    if (partError) {
      console.error('Error fetching participations:', partError)
      return NextResponse.json({ error: partError.message }, { status: 500 })
    }

    if (!participations || participations.length === 0) {
      return NextResponse.json({ unreadCount: 0 })
    }

    const convIds = participations.map(p => p.conversation_id)

    // Get last_read_at for each conversation
    const { data: myParticipations } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('account_id', userId)
      .in('conversation_id', convIds)

    // Count unread messages across all conversations
    let totalUnread = 0
    
    for (const part of myParticipations || []) {
      const lastRead = part.last_read_at ? new Date(part.last_read_at) : new Date(0)
      
      const { data: unreadMessages } = await supabaseAdmin
        .from('messages')
        .select('id, created_at')
        .eq('conversation_id', part.conversation_id)
        .neq('sender_id', userId)

      if (unreadMessages) {
        totalUnread += unreadMessages.filter(m => new Date(m.created_at) > lastRead).length
      }
    }

    return NextResponse.json({ unreadCount: totalUnread })
  } catch (error) {
    console.error('Error in GET /api/messages/unread:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
