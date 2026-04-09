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

    // Get all conversations for the user
    const conversations = await sql`
      SELECT 
        c.id,
        c.participant_1_id,
        c.participant_2_id,
        c.last_message_at,
        c.created_at,
        CASE 
          WHEN c.participant_1_id = ${userId} THEN c.participant_2_id
          ELSE c.participant_1_id
        END as other_participant_id,
        p.display_name,
        p.email,
        p.avatar_url,
        p.role,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND recipient_id = ${userId} AND is_read = false) as unread_count,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      LEFT JOIN profiles p ON (
        CASE 
          WHEN c.participant_1_id = ${userId} THEN p.id = c.participant_2_id
          ELSE p.id = c.participant_1_id
        END
      )
      WHERE c.participant_1_id = ${userId} OR c.participant_2_id = ${userId}
      ORDER BY c.last_message_at DESC
      LIMIT 100
    `

    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    console.error('[v0] Fetch conversations error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
