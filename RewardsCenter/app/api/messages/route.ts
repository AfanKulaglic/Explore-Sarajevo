import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3005'
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL || 'eldardzuho2000@gmail.com'

// Cache for all accounts - fetched once per request cycle
let accountsCache: Map<string, any> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30000 // 30 seconds

// Helper to fetch all accounts and cache them
async function getAllAccountsCached(): Promise<Map<string, any>> {
  const now = Date.now()
  
  // Return cached data if still valid
  if (accountsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return accountsCache
  }
  
  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts?limit=1000`, {
      headers: { 'x-admin-email': ADMIN_EMAIL }
    })
    
    if (response.ok) {
      const data = await response.json()
      const accounts = data.data || []
      
      // Build a map for O(1) lookups by ID
      accountsCache = new Map()
      for (const account of accounts) {
        accountsCache.set(account.id, account)
      }
      cacheTimestamp = now
      return accountsCache
    }
  } catch (e) {
    console.error('[getAllAccountsCached] Error fetching accounts:', e)
  }
  
  // Return empty map on failure, but don't cache it
  return new Map()
}

// Helper to get user info from central system (uses cache)
async function getUserInfo(userId: string) {
  try {
    const accounts = await getAllAccountsCached()
    const account = accounts.get(userId)
    
    if (account) {
      return {
        id: account.id,
        email: account.email,
        name: account.name || account.email?.split('@')[0] || 'Anonymous',
        avatar_url: account.avatar_url
      }
    }
  } catch (e) {
    console.error('[getUserInfo] Error:', e)
  }
  return null
}

// Helper to find or create a conversation between two users
async function getOrCreateConversation(userId1: string, userId2: string) {
  // Find existing conversation where both users are participants
  const { data: existingConvs } = await supabaseAdmin
    .from('conversation_participants')
    .select('conversation_id')
    .eq('account_id', userId1)

  if (existingConvs && existingConvs.length > 0) {
    const convIds = existingConvs.map(c => c.conversation_id)
    
    // Check if userId2 is in any of these conversations
    const { data: sharedConv } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('account_id', userId2)
      .in('conversation_id', convIds)
      .limit(1)
      .single()

    if (sharedConv) {
      return sharedConv.conversation_id
    }
  }

  // Create new conversation
  const { data: newConv, error: convError } = await supabaseAdmin
    .from('conversations')
    .insert({})
    .select()
    .single()

  if (convError || !newConv) {
    throw new Error('Failed to create conversation')
  }

  // Add both participants
  await supabaseAdmin
    .from('conversation_participants')
    .insert([
      { conversation_id: newConv.id, account_id: userId1 },
      { conversation_id: newConv.id, account_id: userId2 }
    ])

  return newConv.id
}

/**
 * GET /api/messages - Get conversations or messages for a user
 * POST /api/messages - Send a new message
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const friendId = searchParams.get('friend_id') // Get messages with specific friend
    const conversationId = searchParams.get('conversation_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // If conversationId or friendId provided, get messages from that conversation
    if (conversationId || friendId) {
      let convId = conversationId

      // If friendId provided, find the conversation between these users
      if (friendId && !convId) {
        const { data: myConvs } = await supabaseAdmin
          .from('conversation_participants')
          .select('conversation_id')
          .eq('account_id', userId)

        if (myConvs && myConvs.length > 0) {
          const convIds = myConvs.map(c => c.conversation_id)
          const { data: sharedConv } = await supabaseAdmin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('account_id', friendId)
            .in('conversation_id', convIds)
            .limit(1)
            .single()
          
          convId = sharedConv?.conversation_id
        }
      }

      if (!convId) {
        return NextResponse.json({ data: [] })
      }

      // Get messages from this conversation
      const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Update last_read_at for the current user in this conversation
      await supabaseAdmin
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', convId)
        .eq('account_id', userId)

      // Get participant's last_read_at to determine which messages are read
      const { data: participant } = await supabaseAdmin
        .from('conversation_participants')
        .select('last_read_at')
        .eq('conversation_id', convId)
        .eq('account_id', userId)
        .single()

      const lastReadAt = participant?.last_read_at ? new Date(participant.last_read_at) : new Date(0)

      // Format messages with user info
      const formattedMessages = await Promise.all((messages || []).map(async msg => {
        const senderInfo = await getUserInfo(msg.sender_id)
        const msgDate = new Date(msg.created_at)
        return {
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          sender_name: senderInfo?.name || 'Unknown',
          sender_avatar_url: senderInfo?.avatar_url || null,
          content: msg.content,
          created_at: msg.created_at,
          is_read: msg.sender_id === userId || msgDate <= lastReadAt
        }
      }))

      return NextResponse.json({ data: formattedMessages })
    }

    // Otherwise, get all conversations for this user
    const { data: participations, error: partError } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('account_id', userId)

    if (partError) {
      console.error('Error fetching conversations:', partError)
      return NextResponse.json({ error: partError.message }, { status: 500 })
    }

    if (!participations || participations.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const convIds = participations.map(p => p.conversation_id)

    // Get conversations with their latest messages
    const conversations = []
    
    for (const convId of convIds) {
      // Get the other participant(s)
      const { data: otherParticipants } = await supabaseAdmin
        .from('conversation_participants')
        .select('account_id')
        .eq('conversation_id', convId)
        .neq('account_id', userId)

      if (!otherParticipants || otherParticipants.length === 0) continue

      const friendUserId = otherParticipants[0].account_id
      const friendInfo = await getUserInfo(friendUserId)

      // Get latest message
      const { data: latestMessage } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!latestMessage) continue // Skip empty conversations

      // Get user's last_read_at for this conversation
      const { data: myParticipation } = await supabaseAdmin
        .from('conversation_participants')
        .select('last_read_at')
        .eq('conversation_id', convId)
        .eq('account_id', userId)
        .single()

      // Count unread messages (messages from others after my last_read_at)
      let unreadCount = 0
      if (myParticipation) {
        const lastReadFilter = myParticipation.last_read_at 
          ? `.gt.${myParticipation.last_read_at}` 
          : null

        // Get all messages not from me
        const { data: unreadMessages } = await supabaseAdmin
          .from('messages')
          .select('id, created_at')
          .eq('conversation_id', convId)
          .neq('sender_id', userId)

        // Filter those after last_read_at
        if (unreadMessages) {
          const lastRead = myParticipation.last_read_at ? new Date(myParticipation.last_read_at) : new Date(0)
          unreadCount = unreadMessages.filter(m => new Date(m.created_at) > lastRead).length
        }
      }

      conversations.push({
        conversationId: convId,
        friendId: friendUserId,
        friendName: friendInfo?.name || 'Unknown User',
        friendAvatarUrl: friendInfo?.avatar_url || null,
        lastMessage: latestMessage.content,
        lastMessageTime: latestMessage.created_at,
        lastMessageSenderId: latestMessage.sender_id,
        unreadCount
      })
    }

    // Sort by latest message time
    conversations.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    )

    return NextResponse.json({ data: conversations })
  } catch (error) {
    console.error('Error in GET /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sender_id, 
      receiver_id, 
      content,
      conversation_id
    } = body

    if (!sender_id || (!receiver_id && !conversation_id) || !content) {
      return NextResponse.json(
        { error: 'sender_id, (receiver_id or conversation_id), and content are required' },
        { status: 400 }
      )
    }

    let convId = conversation_id

    // If receiver_id provided (starting new chat or continuing with friend)
    if (receiver_id && !convId) {
      // Verify they are friends - check both directions
      const { data: friendships, error: friendError } = await supabaseAdmin
        .from('friendships')
        .select('id, requester_id, addressee_id, accepted_at')
        .not('accepted_at', 'is', null)

      // Filter for friendship between these two users
      const friendship = friendships?.find(f => 
        (f.requester_id === sender_id && f.addressee_id === receiver_id) ||
        (f.requester_id === receiver_id && f.addressee_id === sender_id)
      )

      if (friendError || !friendship) {
        console.log('Friendship check failed:', { sender_id, receiver_id, friendships, friendError })
        return NextResponse.json(
          { error: 'You can only message friends. Send a friend request first.' },
          { status: 403 }
        )
      }

      // Get or create conversation
      convId = await getOrCreateConversation(sender_id, receiver_id)
    }

    if (!convId) {
      return NextResponse.json({ error: 'Could not find or create conversation' }, { status: 400 })
    }

    // Verify sender is participant of this conversation
    const { data: isParticipant } = await supabaseAdmin
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', convId)
      .eq('account_id', sender_id)
      .single()

    if (!isParticipant) {
      return NextResponse.json({ error: 'You are not part of this conversation' }, { status: 403 })
    }

    // Create the message
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id,
        content
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get sender info for response
    const senderInfo = await getUserInfo(sender_id)

    return NextResponse.json({ 
      data: {
        ...message,
        sender_name: senderInfo?.name || 'Unknown',
        sender_avatar_url: senderInfo?.avatar_url || null
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
