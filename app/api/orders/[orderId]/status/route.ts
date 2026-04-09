import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    const userRole = cookieStore.get('user_role')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the order exists and belongs to this PRO (or admin)
    const orderResult = await sql`
      SELECT id, pro_id, status FROM orders WHERE id = ${orderId}
    `

    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderResult[0]

    // Only PRO assigned to order or admin can update
    if (userRole !== 'admin' && order.pro_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Valid status transitions
    const validStatuses = ['pending_assignment', 'assigned', 'in_progress', 'completed', 'disputed', 'refunded']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update order status
    const updated = await sql`
      UPDATE orders
      SET 
        status = ${status},
        updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `

    // Log the action
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${userId}, 'order_status_updated', 'order', ${orderId}, ${JSON.stringify({
        new_status: status,
        old_status: order.status
      })}, NOW())
    `

    return NextResponse.json({
      success: true,
      order: updated[0]
    })
  } catch (error) {
    console.error('[v0] Update order status error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
