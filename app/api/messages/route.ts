import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

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
      const messages = await sql`
        SELECT 
          m.id,
          m.conversation_id,
          m.sender_id,
          m.content,
          m.created_at,
          p.display_name as sender_name,
          p.avatar_url as sender_avatar
        FROM messages m
        LEFT JOIN profiles p ON m.sender_id = p.id
        WHERE m.conversation_id = ${conversationId}
        ORDER BY m.created_at ASC
        LIMIT 100
      `

      console.log('[v0] Messages API - found messages:', messages?.length || 0)
      return NextResponse.json({ messages: messages || [] })
    }

    // Otherwise fetch all conversations for user
    const conversations = await sql`
      SELECT 
        c.id,
        c.order_id,
        c.client_id,
        c.pro_id,
        c.last_message_at,
        c.created_at,
        o.order_number,
        s.title as service_title,
        CASE 
          WHEN c.client_id = ${userId} THEN pc.display_name
          ELSE pp.display_name
        END as other_user_name,
        CASE 
          WHEN c.client_id = ${userId} THEN pc.avatar_url
          ELSE pp.avatar_url
        END as other_user_avatar,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      LEFT JOIN orders o ON c.order_id = o.id
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN profiles pc ON c.pro_id = pc.id
      LEFT JOIN profiles pp ON c.client_id = pp.id
      WHERE c.client_id = ${userId} OR c.pro_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT 50
    `

    console.log('[v0] Conversations API - found conversations:', conversations?.length || 0)
    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    console.error('[v0] Messages API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, content } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user is part of this conversation
    const conversation = await sql`
      SELECT id FROM conversations 
      WHERE id = ${conversationId} AND (client_id = ${userId} OR pro_id = ${userId})
    `

    if (!conversation || conversation.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Create message
    const message = await sql`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        created_at
      ) VALUES (
        ${conversationId},
        ${userId},
        ${content},
        NOW()
      )
      RETURNING *
    `

    // Update conversation last_message_at
    await sql`
      UPDATE conversations 
      SET last_message_at = NOW()
      WHERE id = ${conversationId}
    `

    console.log('[v0] Messages API - sent message:', message[0].id)
    return NextResponse.json({ message: message[0], success: true })
  } catch (error) {
    console.error('[v0] Messages API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
