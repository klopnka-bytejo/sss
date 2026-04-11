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

    // Verify admin role
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get messages for this conversation using correct column names
    const messages = await sql`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.is_read,
        m.created_at,
        p.display_name as sender_name,
        p.role as sender_role
      FROM messages m
      LEFT JOIN profiles p ON m.sender_id = p.id
      WHERE m.conversation_id = ${id}
      ORDER BY m.created_at ASC
    `

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Message detail error:', msg)
    return NextResponse.json({ error: 'Failed to fetch messages', details: msg }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { content, recipientId } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 })
    }

    // Verify recipient exists
    const recipientCheck = await sql`
      SELECT id FROM profiles WHERE id = ${recipientId}
    `

    if (!recipientCheck || recipientCheck.length === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Insert message with correct column names
    const messageResult = await sql`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at,
        updated_at
      ) VALUES (
        ${conversationId},
        ${userId},
        ${recipientId},
        ${content.trim()},
        false,
        NOW(),
        NOW()
      )
      RETURNING *
    `

    if (!messageResult || messageResult.length === 0) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update conversation last_message_at
    await sql`
      UPDATE conversations 
      SET last_message_at = NOW()
      WHERE id = ${conversationId}
    `

    return NextResponse.json({
      success: true,
      message: messageResult[0]
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Send message error:', msg)
    return NextResponse.json({ error: 'Failed to send message', details: msg }, { status: 500 })
  }
}
