import { sql } from '@/lib/neon/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all orders for this pro (pending, accepted, in-progress)
    const orders = await sql`
      SELECT 
        o.*,
        s.title as service_title,
        s.description as service_description,
        s.base_price_cents,
        g.name as game_name,
        g.slug as game_slug,
        c.display_name as client_name,
        c.email as client_email
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN games g ON s.game_id = g.id
      LEFT JOIN profiles c ON o.client_id = c.id
      WHERE o.pro_id = ${userId} OR (o.status = 'pending' AND s.pro_id IS NULL)
      ORDER BY o.created_at DESC
    `

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('[v0] Orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, action, proNotes } = await request.json()

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Get order
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]

    if (action === 'accept') {
      // Accept order - assign to pro
      const updated = await sql`
        UPDATE orders 
        SET 
          pro_id = ${userId},
          status = 'accepted',
          pro_notes = ${proNotes || ''},
          accepted_at = NOW(),
          updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
      `

      // Create system message
      await sql`
        INSERT INTO order_messages (
          order_id, sender_id, content, message_type, is_system
        ) VALUES (
          ${orderId}, ${userId}, 'Order accepted by pro', 'system', true
        )
      `

      return NextResponse.json({ order: updated[0] })
    } 
    else if (action === 'complete') {
      // Mark order as complete
      const updated = await sql`
        UPDATE orders 
        SET 
          status = 'completed',
          completed_at = NOW(),
          updated_at = NOW()
        WHERE id = ${orderId} AND pro_id = ${userId}
        RETURNING *
      `

      await sql`
        INSERT INTO order_messages (
          order_id, sender_id, content, message_type, is_system
        ) VALUES (
          ${orderId}, ${userId}, 'Order marked as complete', 'system', true
        )
      `

      return NextResponse.json({ order: updated[0] })
    }
    else if (action === 'deliver') {
      // Mark as delivered
      const updated = await sql`
        UPDATE orders 
        SET 
          status = 'delivered',
          delivered_at = NOW(),
          updated_at = NOW()
        WHERE id = ${orderId} AND pro_id = ${userId}
        RETURNING *
      `

      return NextResponse.json({ order: updated[0] })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Order action error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
