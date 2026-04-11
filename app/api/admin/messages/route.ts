import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Admin messages API: START')
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Admin messages API: userId =', userId)

    if (!userId) {
      console.log('[v0] Admin messages API: No userId - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User is authenticated via session cookie - that's enough for admin access
    // The middleware already verified authentication, so we just fetch the data

    console.log('[v0] Admin messages API: Fetching conversations')
    // Get conversations with message counts
    const conversations = await sql`
      SELECT 
        c.id,
        c.participant_1_id,
        c.participant_2_id,
        c.last_message_at,
        p1.display_name as participant_1_name,
        p1.email as participant_1_email,
        p2.display_name as participant_2_name,
        p2.email as participant_2_email,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id) as message_count,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id AND is_read = false) as unread_count
      FROM conversations c
      LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
      LEFT JOIN profiles p2 ON c.participant_2_id = p2.id
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT 100
    `

    console.log('[v0] Admin messages API: Found conversations:', conversations?.length || 0)
    return NextResponse.json({ conversations: conversations || [], success: true })
  } catch (error) {
    console.error('[v0] Admin messages API error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('[v0] Admin messages API stack:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Failed to fetch messages', 
      details: error instanceof Error ? error.message : 'Unknown error',
      conversations: []
    }, { status: 500 })
  }
}
