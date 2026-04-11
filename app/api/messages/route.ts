import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

// ACTUAL messages table schema: id, conversation_id, sender_id, content, read, created_at
// NO recipient_id, NO is_read, NO read_at, NO updated_at

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    // If conversationId provided, fetch specific conversation messages
    if (conversationId) {
      // First verify user is part of this conversation
      const conversationCheck = await sql`
        SELECT id FROM conversations 
        WHERE id = ${conversationId} AND (participant_1_id = ${userId} OR participant_2_id = ${userId})
      `

      if (!conversationCheck || conversationCheck.length === 0) {
        return NextResponse.json({ error: 'Unauthorized access to conversation' }, { status: 403 })
      }

      // Using actual schema columns: id, conversation_id, sender_id, content, read, created_at
      const messages = await sql`
        SELECT 
          m.id,
          m.conversation_id,
          m.sender_id,
          m.content,
          m.read,
          m.created_at,
          p.display_name as sender_name,
          p.avatar_url as sender_avatar
        FROM messages m
        LEFT JOIN profiles p ON m.sender_id = p.id
        WHERE m.conversation_id = ${conversationId}
        ORDER BY m.created_at ASC
        LIMIT 100
      `
      
      // Mark messages as read (messages not from current user)
      if (messages && messages.length > 0) {
        await sql`
          UPDATE messages 
          SET read = true
          WHERE conversation_id = ${conversationId} 
            AND sender_id != ${userId} 
            AND read = false
        `
      }

      return NextResponse.json({ messages: messages || [] })
    }

    // Otherwise fetch all conversations for user
    const conversations = await sql`
      SELECT 
        c.id,
        c.participant_1_id,
        c.participant_2_id,
        c.last_message_at,
        c.created_at,
        CASE 
          WHEN c.participant_1_id = ${userId} THEN p2.display_name
          ELSE p1.display_name
        END as other_user_name,
        CASE 
          WHEN c.participant_1_id = ${userId} THEN p2.avatar_url
          ELSE p1.avatar_url
        END as other_user_avatar,
        CASE 
          WHEN c.participant_1_id = ${userId} THEN c.participant_2_id
          ELSE c.participant_1_id
        END as other_user_id,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id AND sender_id != ${userId} AND read = false) as unread_count
      FROM conversations c
      LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
      LEFT JOIN profiles p2 ON c.participant_2_id = p2.id
      WHERE c.participant_1_id = ${userId} OR c.participant_2_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT 50
    `

    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, content } = body

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user is part of this conversation
    const conversation = await sql`
      SELECT 
        id,
        participant_1_id,
        participant_2_id
      FROM conversations 
      WHERE id = ${conversationId} AND (participant_1_id = ${userId} OR participant_2_id = ${userId})
    `

    if (!conversation || conversation.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Create message using ACTUAL schema columns: conversation_id, sender_id, content, read
    const newMessage = await sql`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        read
      ) VALUES (
        ${conversationId},
        ${userId},
        ${content.trim()},
        false
      )
      RETURNING id, conversation_id, sender_id, content, read, created_at
    `

    // Update conversation last_message_at
    await sql`
      UPDATE conversations 
      SET last_message_at = NOW()
      WHERE id = ${conversationId}
    `

    return NextResponse.json({
      success: true,
      message: newMessage[0]
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to send message', details: message }, { status: 500 })
  }
}
