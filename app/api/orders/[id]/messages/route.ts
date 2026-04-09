import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

    // Get order to verify access
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${id}
    `

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]

    // Verify user is client or pro on this order
    if (order.client_id !== userId && order.pro_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all messages for this order (placeholder - order_messages table doesn't exist)
    const messages: any[] = []

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[v0] Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
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

    const { content, messageType } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Get order to verify access
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${id}
    `

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]

    // Verify user is client or pro on this order
    if (order.client_id !== userId && order.pro_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create message placeholder - order_messages table doesn't exist yet
    const message = {
      id: Date.now().toString(),
      content,
      sender_id: userId,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('[v0] Send message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
