import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User is authenticated via session cookie - that's enough for admin access
    // Fetch all conversations with related user data
    const conversations = await sql`
      SELECT 
        c.id,
        c.participant_1_id,
        c.participant_2_id,
        c.last_message_at,
        c.created_at,
        p1.display_name as participant_1_name,
        p1.email as participant_1_email,
        p1.avatar_url as participant_1_avatar,
        p2.display_name as participant_2_name,
        p2.email as participant_2_email,
        p2.avatar_url as participant_2_avatar,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id) as message_count,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id AND is_read = false) as unread_count
      FROM conversations c
      LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
      LEFT JOIN profiles p2 ON c.participant_2_id = p2.id
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT 100
    `

    console.log('[v0] Admin conversations API - found conversations:', conversations?.length || 0)
    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    console.error('[v0] Admin conversations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    // Delete all messages in the conversation
    await sql`
      DELETE FROM messages WHERE conversation_id = ${conversationId}
    `

    // Delete the conversation
    await sql`
      DELETE FROM conversations WHERE id = ${conversationId}
    `

    console.log('[v0] Conversation deleted:', conversationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Delete conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
