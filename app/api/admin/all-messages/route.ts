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

    // Fetch all messages with related conversation and user data
    const messages = await sql`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.is_read,
        m.read_at,
        m.created_at,
        m.updated_at,
        s.email as sender_email,
        s.display_name as sender_name,
        s.avatar_url as sender_avatar,
        r.email as recipient_email,
        r.display_name as recipient_name,
        r.avatar_url as recipient_avatar,
        c.last_message_at as conversation_last_message,
        c.created_at as conversation_created_at
      FROM messages m
      LEFT JOIN profiles s ON m.sender_id = s.id
      LEFT JOIN profiles r ON m.recipient_id = r.id
      LEFT JOIN conversations c ON m.conversation_id = c.id
      ORDER BY m.created_at DESC
      LIMIT 200
    `

    console.log('[v0] Admin messages API - found messages:', messages?.length || 0)
    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('[v0] Admin messages API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json({ error: 'Missing messageId' }, { status: 400 })
    }

    await sql`
      DELETE FROM messages 
      WHERE id = ${messageId}
    `

    console.log('[v0] Admin messages API - deleted message:', messageId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Admin messages API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
