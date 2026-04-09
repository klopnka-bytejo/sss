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

    // Check if user is admin
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all messages in the conversation
    const messages = await sql`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.sender_id,
        p.display_name as sender_name,
        p.email as sender_email
      FROM messages m
      LEFT JOIN profiles p ON m.sender_id = p.id
      WHERE m.conversation_id = ${id}
      ORDER BY m.created_at ASC
    `

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('[v0] Admin conversation messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
