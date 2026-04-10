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

    // Check if user is admin
    if (userId === 'admin-hardcoded-user') {
      // Hardcoded admin is always authorized
    } else if (userRole === 'admin') {
      // User has admin role cookie
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, proId } = await request.json()

    if (!orderId || !proId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the order exists
    const orderResult = await sql`
      SELECT id, status FROM orders WHERE id = ${orderId}
    `

    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify the PRO exists
    const proResult = await sql`
      SELECT id, display_name FROM profiles WHERE id = ${proId} AND role = 'pro'
    `

    if (!proResult || proResult.length === 0) {
      return NextResponse.json({ error: 'PRO not found' }, { status: 404 })
    }

    // Update order with PRO assignment
    const updated = await sql`
      UPDATE orders
      SET 
        pro_id = ${proId},
        status = 'assigned',
        updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `

    // Log the action
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${userId}, 'order_assigned_to_pro', 'order', ${orderId}, ${JSON.stringify({
        pro_id: proId,
        pro_name: proResult[0].display_name
      })}, NOW())
    `

    return NextResponse.json({
      success: true,
      order: updated[0]
    })
  } catch (error) {
    console.error('[v0] Assign order error:', error)
    return NextResponse.json(
      { error: 'Failed to assign order' },
      { status: 500 }
    )
  }
}
