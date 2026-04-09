import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
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

    // Get messages for this order
    const messages = await sql`
      SELECT 
        m.id,
        m.message,
        m.is_system,
        m.created_at,
        p.display_name as sender_name,
        p.role as sender_role
      FROM order_messages m
      LEFT JOIN profiles p ON m.sender_id = p.id
      WHERE m.order_id = ${orderId}
      ORDER BY m.created_at ASC
    `

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Message detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
