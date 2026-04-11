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

    // Get messages for this conversation using ACTUAL schema columns
    // Schema has: id, conversation_id, sender_id, content, read (NOT is_read, NO recipient_id)
    const messages = await sql`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.read,
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
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Verify conversation exists
    const convCheck = await sql`
      SELECT id FROM conversations WHERE id = ${conversationId}
    `

    if (!convCheck || convCheck.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Insert message using ACTUAL schema columns
    // Schema has: id, conversation_id, sender_id, content, read (NOT recipient_id, NOT is_read, NOT updated_at)
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
