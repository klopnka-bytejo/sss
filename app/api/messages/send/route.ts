import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Send message: START')
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Send message: userId =', userId)

    if (!userId) {
      console.log('[v0] Send message: No userId - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, message } = body

    console.log('[v0] Send message: recipientId =', recipientId, 'message length =', message?.length)

    if (!recipientId || !message?.trim()) {
      console.log('[v0] Send message: Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if recipient exists
    console.log('[v0] Send message: Checking recipient exists')
    const recipient = await sql`
      SELECT id FROM profiles WHERE id = ${recipientId}
    `

    if (!recipient || recipient.length === 0) {
      console.log('[v0] Send message: Recipient not found')
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Get or create conversation
    console.log('[v0] Send message: Checking for existing conversation')
    let conversation = await sql`
      SELECT id FROM conversations
      WHERE (participant_1_id = ${userId} AND participant_2_id = ${recipientId})
         OR (participant_1_id = ${recipientId} AND participant_2_id = ${userId})
      LIMIT 1
    `

    let conversationId: string

    if (conversation && conversation.length > 0) {
      conversationId = conversation[0].id
      console.log('[v0] Send message: Found existing conversation:', conversationId)
    } else {
      // Create new conversation
      console.log('[v0] Send message: Creating new conversation')
      const newConversation = await sql`
        INSERT INTO conversations (participant_1_id, participant_2_id, created_at, last_message_at)
        VALUES (${userId}, ${recipientId}, NOW(), NOW())
        RETURNING id
      `
      conversationId = newConversation[0].id
      console.log('[v0] Send message: Created new conversation:', conversationId)
    }

    // Create message
    console.log('[v0] Send message: Creating message record')
    const newMessage = await sql`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at
      ) VALUES (
        ${conversationId},
        ${userId},
        ${recipientId},
        ${message.trim()},
        false,
        NOW()
      )
      RETURNING *
    `

    console.log('[v0] Send message: Message created:', newMessage[0].id)

    // Update conversation last_message_at
    console.log('[v0] Send message: Updating conversation last_message_at')
    await sql`
      UPDATE conversations 
      SET last_message_at = NOW()
      WHERE id = ${conversationId}
    `

    // Log in audit log
    console.log('[v0] Send message: Logging audit trail')
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${userId}, 'message_sent', 'message', ${newMessage[0].id}, ${JSON.stringify({
        sender_id: userId,
        recipient_id: recipientId,
        conversation_id: conversationId
      })}, NOW())
    `

    console.log('[v0] Send message: SUCCESS')
    return NextResponse.json({
      success: true,
      message: newMessage[0]
    })
  } catch (error) {
    console.error('[v0] Send message error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('[v0] Send message stack:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
