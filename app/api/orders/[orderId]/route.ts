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

    const orders = await sql`
      SELECT 
        o.*,
        s.title as service_title,
        s.description as service_description,
        s.base_price_cents,
        g.name as game_name,
        g.slug as game_slug,
        c.display_name as client_name,
        c.email as client_email,
        p.display_name as pro_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN games g ON s.game_id = g.id
      LEFT JOIN profiles c ON o.client_id = c.id
      LEFT JOIN profiles p ON o.pro_id = p.id
      WHERE o.id = ${orderId} AND (o.client_id = ${userId} OR o.pro_id = ${userId})
    `

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order: orders[0] })
  } catch (error) {
    console.error('[v0] Get order error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
