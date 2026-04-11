import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

// Validation helper
function validateMessage(data: any) {
  const errors: Record<string, string> = {}
  
  if (!data.recipientId) errors.recipientId = 'Recipient ID is required'
  if (!data.content?.trim() && !data.message?.trim()) errors.content = 'Message content is required'
  
  return Object.keys(errors).length === 0 ? null : errors
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const recipientId = body.recipientId || body.recipient_id
    const content = body.content || body.message

    // Validate request
    const validationErrors = validateMessage({ recipientId, content })
    if (validationErrors) {
      return NextResponse.json(
        { success: false, errors: validationErrors, message: 'Validation failed' },
        { status: 400 }
      )
    }

    // Prevent sending message to yourself
    if (recipientId === userId) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 })
    }

    // Check if recipient exists using template literal
    const recipientResult = await sql`SELECT id FROM profiles WHERE id = ${recipientId}`

    if (!recipientResult || recipientResult.length === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Get or create conversation using template literal
    const conversationResult = await sql`
      SELECT id FROM conversations
      WHERE (participant_1_id = ${userId} AND participant_2_id = ${recipientId})
         OR (participant_1_id = ${recipientId} AND participant_2_id = ${userId})
      LIMIT 1
    `

    let conversationId: string

    if (conversationResult && conversationResult.length > 0) {
      conversationId = conversationResult[0].id
    } else {
      // Create new conversation
      const newConvResult = await sql`
        INSERT INTO conversations (participant_1_id, participant_2_id, created_at, last_message_at)
        VALUES (${userId}, ${recipientId}, NOW(), NOW())
        RETURNING id
      `
      conversationId = newConvResult[0].id
    }

    // Create message using ACTUAL schema columns
    // Schema has: id, conversation_id, sender_id, content, read, created_at
    // NO recipient_id, NO is_read, NO updated_at
    const messageResult = await sql`
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

    if (!messageResult || messageResult.length === 0) {
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    // Update conversation last_message_at
    await sql`UPDATE conversations SET last_message_at = NOW() WHERE id = ${conversationId}`

    return NextResponse.json({
      success: true,
      message: messageResult[0]
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      success: false,
      error: 'Failed to send message',
      details: message
    }, { status: 500 })
  }
}
