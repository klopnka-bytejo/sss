import { sql } from '@/lib/neon/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get order to verify access
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]

    // Verify user is client or pro on this order
    if (order.client_id !== userId && order.pro_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all messages for this order
    const messages = await sql`
      SELECT 
        m.*,
        p.display_name as sender_name,
        p.avatar_url
      FROM order_messages m
      LEFT JOIN profiles p ON m.sender_id = p.id
      WHERE m.order_id = ${orderId}
      ORDER BY m.created_at ASC
    `

    // Mark messages as read
    await sql`
      UPDATE order_messages 
      SET is_read = true 
      WHERE order_id = ${orderId} AND sender_id != ${userId} AND is_read = false
    `

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[v0] Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, messageType } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Get order to verify access
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]

    // Verify user is client or pro on this order
    if (order.client_id !== userId && order.pro_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create message
    const message = await sql`
      INSERT INTO order_messages (
        order_id, sender_id, content, message_type, is_read
      ) VALUES (
        ${orderId}, ${userId}, ${content}, ${messageType || 'text'}, false
      )
      RETURNING *
    `

    // Get sender info
    const senderInfo = await sql`
      SELECT display_name, avatar_url FROM profiles WHERE id = ${userId}
    `

    return NextResponse.json({ 
      message: {
        ...message[0],
        sender_name: senderInfo[0]?.display_name,
        avatar_url: senderInfo[0]?.avatar_url
      }
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Send message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
