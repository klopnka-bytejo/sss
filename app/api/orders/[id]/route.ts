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

    const orders = await sql`
      SELECT 
        o.*,
        s.title as service_title,
        s.description as service_description,
        s.price_cents,
        c.display_name as client_name,
        c.email as client_email,
        p.display_name as pro_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN profiles c ON o.client_id = c.id
      LEFT JOIN profiles p ON o.pro_id = p.id
      WHERE o.id = ${id} AND (o.client_id = ${userId} OR o.pro_id = ${userId})
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

export async function PATCH(
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

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status required' }, { status: 400 })
    }

    // Get order and verify authorization
    const order = await sql`SELECT * FROM orders WHERE id = ${id}`
    
    if (!order || order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const orderData = order[0]
    
    // Check if user is admin or assigned PRO
    const profile = await sql`SELECT role FROM profiles WHERE id = ${userId}`
    
    if (profile[0].role !== 'admin' && orderData.pro_id !== userId) {
      return NextResponse.json({ error: 'Only assigned PRO can update this order' }, { status: 403 })
    }

    // Update order status
    const updated = await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    // Log to audit log
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${userId}, 'order_status_updated', 'order', ${id}, ${JSON.stringify({
        old_status: orderData.status,
        new_status: status,
        updated_by: userId
      })}, NOW())
    `

    return NextResponse.json({ order: updated[0] })
  } catch (error) {
    console.error('[v0] Update order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

