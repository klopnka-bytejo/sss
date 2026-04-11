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
    console.log('[v0] Send message: START')
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Send message: userId =', userId)

    if (!userId) {
      console.log('[v0] Send message: No userId - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const recipientId = body.recipientId || body.recipient_id
    const content = body.content || body.message

    // Validate request
    const validationErrors = validateMessage({ recipientId, content })
    if (validationErrors) {
      console.log('[v0] Send message: Validation errors:', validationErrors)
      return NextResponse.json(
        { success: false, errors: validationErrors, message: 'Validation failed' },
        { status: 400 }
      )
    }

    console.log('[v0] Send message: recipientId =', recipientId, 'content length =', content?.length)

    // Check if recipient exists
    console.log('[v0] Send message: Checking recipient exists')
    const recipientQuery = `SELECT id FROM profiles WHERE id = $1`
    const recipientResult = await sql.query(recipientQuery, [recipientId])

    if (!recipientResult || recipientResult.length === 0) {
      console.log('[v0] Send message: Recipient not found')
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Get or create conversation
    console.log('[v0] Send message: Checking for existing conversation')
    const conversationQuery = `
      SELECT id FROM conversations
      WHERE (participant_1_id = $1 AND participant_2_id = $2)
         OR (participant_1_id = $2 AND participant_2_id = $1)
      LIMIT 1
    `
    const conversationResult = await sql.query(conversationQuery, [userId, recipientId])

    let conversationId: string

    if (conversationResult && conversationResult.length > 0) {
      conversationId = conversationResult[0].id
      console.log('[v0] Send message: Found existing conversation:', conversationId)
    } else {
      // Create new conversation
      console.log('[v0] Send message: Creating new conversation')
      const createConvQuery = `
        INSERT INTO conversations (participant_1_id, participant_2_id, created_at, last_message_at)
        VALUES ($1, $2, NOW(), NOW())
        RETURNING id
      `
      const newConvResult = await sql.query(createConvQuery, [userId, recipientId])
      conversationId = newConvResult[0].id
      console.log('[v0] Send message: Created new conversation:', conversationId)
    }

    // Create message with parameterized query
    console.log('[v0] Send message: Creating message record')
    const messageQuery = `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), NOW()
      )
      RETURNING id, conversation_id, sender_id, recipient_id, content, created_at
    `
    const messageResult = await sql.query(messageQuery, [
      conversationId,
      userId,
      recipientId,
      content.trim(),
      false
    ])

    if (!messageResult || messageResult.length === 0) {
      console.error('[v0] Send message: No result from INSERT')
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    console.log('[v0] Send message: Message created:', messageResult[0].id)

    // Update conversation last_message_at
    console.log('[v0] Send message: Updating conversation last_message_at')
    const updateConvQuery = `UPDATE conversations SET last_message_at = NOW() WHERE id = $1`
    await sql.query(updateConvQuery, [conversationId])

    console.log('[v0] Send message: SUCCESS')
    return NextResponse.json({
      success: true,
      message: messageResult[0]
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Send message error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('[v0] Send message stack:', error.stack)
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      success: false,
      error: 'Failed to send message',
      details: message.includes('column') ? `Database: ${message}` : message
    }, { status: 500 })
  }
}
