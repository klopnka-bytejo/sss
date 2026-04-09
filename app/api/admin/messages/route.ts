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
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversations with message counts
    const conversations = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        c.display_name as client_name,
        p.display_name as pro_name,
        (SELECT message FROM order_messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM order_messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM order_messages WHERE order_id = o.id) as message_count,
        false as has_flagged
      FROM orders o
      LEFT JOIN profiles c ON o.client_id = c.id
      LEFT JOIN profiles p ON o.pro_id = p.id
      WHERE EXISTS (SELECT 1 FROM order_messages WHERE order_id = o.id)
      ORDER BY last_message_time DESC
      LIMIT 50
    `

    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    console.error('Messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
