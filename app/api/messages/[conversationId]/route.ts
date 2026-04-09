import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params

    // Verify user is part of this conversation
    const conversation = await sql`
      SELECT * FROM conversations WHERE id = ${conversationId}
      AND (participant_1_id = ${userId} OR participant_2_id = ${userId})
    `

    if (!conversation || conversation.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get messages
    const messages = await sql`
      SELECT 
        m.id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.is_read,
        m.read_at,
        m.created_at,
        p.display_name as sender_name,
        p.avatar_url as sender_avatar,
        p.role as sender_role
      FROM messages m
      LEFT JOIN profiles p ON m.sender_id = p.id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
    `

    // Mark messages as read for the current user
    await sql`
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE conversation_id = ${conversationId} 
      AND recipient_id = ${userId} 
      AND is_read = false
    `

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('[v0] Fetch messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
