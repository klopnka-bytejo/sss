import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all conversations for the current user
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
        END as other_participant_name,
        CASE 
          WHEN c.participant_1_id = ${userId} THEN p2.email
          ELSE p1.email
        END as other_participant_email,
        CASE 
          WHEN c.participant_1_id = ${userId} THEN c.participant_2_id
          ELSE c.participant_1_id
        END as other_participant_id,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id AND sender_id != ${userId} AND read = false) as unread_count
      FROM conversations c
      LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
      LEFT JOIN profiles p2 ON c.participant_2_id = p2.id
      WHERE c.participant_1_id = ${userId} OR c.participant_2_id = ${userId}
      ORDER BY c.last_message_at DESC
    `

    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    console.error('[v0] Fetch conversations error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
