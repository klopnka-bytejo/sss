import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is part of this conversation
    const conversation = await sql`
      SELECT * FROM conversations
      WHERE id = ${id} 
        AND (participant_1_id = ${userId} OR participant_2_id = ${userId})
    `

    if (!conversation || conversation.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get all messages in this conversation
    const messages = await sql`
      SELECT 
        m.*,
        p.display_name as sender_name,
        p.email as sender_email
      FROM messages m
      LEFT JOIN profiles p ON m.sender_id = p.id
      WHERE m.conversation_id = ${id}
      ORDER BY m.created_at ASC
    `

    // Mark messages as read
    await sql`
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE conversation_id = ${id} 
        AND sender_id != ${userId} 
        AND is_read = false
    `

    return NextResponse.json({ 
      messages: messages || [],
      conversation: conversation[0]
    })
  } catch (error) {
    console.error('[v0] Fetch messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
