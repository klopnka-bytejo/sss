import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Messages Conversations API: userId =', userId ? 'present' : 'MISSING')

    if (!userId) {
      console.log('[v0] Messages Conversations API: No userId - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] Messages Conversations API: Querying conversations for userId:', userId)
    
    // Get all conversations for the user - using UNION for cleaner logic
    const conversations = await sql`
      WITH participant_data AS (
        SELECT 
          c.id,
          c.participant_1_id,
          c.participant_2_id,
          c.last_message_at,
          c.created_at,
          CASE 
            WHEN c.participant_1_id = ${userId} THEN c.participant_2_id
            ELSE c.participant_1_id
          END as other_participant_id
        FROM conversations c
        WHERE c.participant_1_id = ${userId} OR c.participant_2_id = ${userId}
      )
      SELECT 
        pd.id,
        pd.participant_1_id,
        pd.participant_2_id,
        pd.last_message_at,
        pd.created_at,
        pd.other_participant_id,
        p.display_name,
        p.email,
        p.avatar_url,
        p.role,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = pd.id AND sender_id != ${userId} AND is_read = false) as unread_count,
        (SELECT content FROM messages WHERE conversation_id = pd.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM participant_data pd
      LEFT JOIN profiles p ON p.id = pd.other_participant_id
      ORDER BY pd.last_message_at DESC NULLS LAST
      LIMIT 100
    `

    console.log('[v0] Messages Conversations API: Found', conversations?.length || 0, 'conversations')
    if (conversations && conversations.length > 0) {
      console.log('[v0] Messages Conversations API: First conversation:', JSON.stringify(conversations[0]).substring(0, 300))
    }

    return NextResponse.json({ conversations: conversations || [], success: true })
  } catch (error) {
    console.error('[v0] Messages Conversations API error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('[v0] Messages Conversations API stack:', error.stack)
    }
    return NextResponse.json({ error: 'Failed to fetch conversations', conversations: [], details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
