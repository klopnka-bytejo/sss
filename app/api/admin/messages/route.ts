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

    // Verify admin role
    const adminCheck = await sql`SELECT role FROM profiles WHERE id = ${userId}`
    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    // Get conversations with message counts using ACTUAL column names from schema
    // Schema has: id, conversation_id, sender_id, content, read (NOT is_read), created_at
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
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id AND read = false) as unread_count
      FROM conversations c
      LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
      LEFT JOIN profiles p2 ON c.participant_2_id = p2.id
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT 100
    `

    return NextResponse.json({ conversations: conversations || [], success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Admin messages error:', msg)
    return NextResponse.json({ 
      error: 'Failed to fetch conversations', 
      details: msg
    }, { status: 500 })
  }
}

    // Verify admin role
    const adminCheck = await sql`SELECT role FROM profiles WHERE id = ${userId}`
    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    // Get conversations with message counts using correct column names from actual schema
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

    return NextResponse.json({ conversations: conversations || [], success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Admin messages error:', msg)
    return NextResponse.json({ 
      error: 'Failed to fetch conversations', 
      details: msg
    }, { status: 500 })
  }
}
