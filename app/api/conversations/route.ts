import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Conversations API: START - userId =', userId)

    if (!userId) {
      console.log('[v0] Conversations API: No userId found')
      return NextResponse.json({ error: 'Unauthorized', conversations: [] }, { status: 401 })
    }

    // Debug: Check if user exists
    const userCheck = await sql`
      SELECT id FROM profiles WHERE id = ${userId}
    `
    console.log('[v0] Conversations API: User exists in DB:', userCheck?.length > 0)

    // Debug: Count total conversations
    const countResult = await sql`
      SELECT COUNT(*) as total FROM conversations
    `
    console.log('[v0] Conversations API: Total conversations in DB:', countResult?.[0]?.total)

    // Get all conversations for the current user - SIMPLIFIED QUERY FIRST
    console.log('[v0] Conversations API: Fetching conversations for userId:', userId)
    const conversations = await sql`
      SELECT 
        c.id,
        c.participant_1_id,
        c.participant_2_id,
        c.last_message_at,
        c.created_at
      FROM conversations c
      WHERE c.participant_1_id = ${userId} OR c.participant_2_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST
    `

    console.log('[v0] Conversations API: Query returned', conversations?.length || 0, 'conversations')

    if (!conversations || conversations.length === 0) {
      console.log('[v0] Conversations API: No conversations found for this user')
      return NextResponse.json({ conversations: [], success: true, message: 'No conversations' })
    }

    // Now fetch additional data for each conversation
    const enrichedConversations = conversations.map(async (conv: any) => {
      const otherParticipantId = conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id
      
      const participantData = await sql`
        SELECT display_name, email FROM profiles WHERE id = ${otherParticipantId}
      `
      
      const lastMessageData = await sql`
        SELECT content, created_at FROM messages WHERE conversation_id = ${conv.id} ORDER BY created_at DESC LIMIT 1
      `
      
      const unreadCount = await sql`
        SELECT COUNT(*) as count FROM messages WHERE conversation_id = ${conv.id} AND sender_id != ${userId} AND read = false
      `

      return {
        id: conv.id,
        participant_1_id: conv.participant_1_id,
        participant_2_id: conv.participant_2_id,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
        other_participant_name: participantData?.[0]?.display_name || 'Unknown',
        other_participant_email: participantData?.[0]?.email || 'unknown@example.com',
        other_participant_id: otherParticipantId,
        last_message: lastMessageData?.[0]?.content || 'No messages yet',
        last_message_time: lastMessageData?.[0]?.created_at,
        unread_count: unreadCount?.[0]?.count || 0
      }
    })

    const enriched = await Promise.all(enrichedConversations)
    console.log('[v0] Conversations API: Enriched conversations, returning', enriched.length)

    return NextResponse.json({ conversations: enriched, success: true })
  } catch (error) {
    console.error('[v0] Conversations API ERROR:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('[v0] Conversations API STACK:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Failed to fetch conversations', 
      conversations: [],
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
