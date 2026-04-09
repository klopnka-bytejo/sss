import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, message } = body

    if (!recipientId || !message?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if recipient exists
    const recipient = await sql`
      SELECT id FROM profiles WHERE id = ${recipientId}
    `

    if (!recipient || recipient.length === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Get or create conversation
    let conversation = await sql`
      SELECT id FROM conversations
      WHERE (participant_1_id = ${userId} AND participant_2_id = ${recipientId})
         OR (participant_1_id = ${recipientId} AND participant_2_id = ${userId})
      LIMIT 1
    `

    let conversationId: string

    if (conversation && conversation.length > 0) {
      conversationId = conversation[0].id
    } else {
      // Create new conversation
      const newConversation = await sql`
        INSERT INTO conversations (participant_1_id, participant_2_id, created_at, last_message_at)
        VALUES (${userId}, ${recipientId}, NOW(), NOW())
        RETURNING id
      `
      conversationId = newConversation[0].id
    }

    // Create message
    const newMessage = await sql`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        created_at
      ) VALUES (
        ${conversationId},
        ${userId},
        ${message.trim()},
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

    // Log in audit log
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${userId}, 'message_sent', 'message', ${newMessage[0].id}, ${JSON.stringify({
        sender_id: userId,
        recipient_id: recipientId,
        conversation_id: conversationId
      })}, NOW())
    `

    return NextResponse.json({
      success: true,
      message: newMessage[0]
    })
  } catch (error) {
    console.error('[v0] Message sending error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
