import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    const userRole = cookieStore.get('user_role')?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a PRO or admin
    if (userRole !== "pro" && userRole !== "admin") {
      return NextResponse.json({ error: "Only PROs can accept orders" }, { status: 403 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get the order
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orders[0]

    // Check if order can be accepted (must be paid and not already assigned)
    if (order.status !== "paid") {
      return NextResponse.json({ error: "Order must be paid to accept" }, { status: 400 })
    }

    if (order.pro_id) {
      return NextResponse.json({ error: "Order already taken" }, { status: 409 })
    }

    // Update order status and assign PRO (atomic operation to prevent race conditions)
    const result = await sql`
      UPDATE orders
      SET 
        status = 'in_progress',
        pro_id = ${userId},
        started_at = NOW(),
        updated_at = NOW()
      WHERE id = ${orderId}
      AND pro_id IS NULL
      AND status = 'paid'
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Order already taken" }, { status: 409 })
    }

    const updatedOrder = result[0]

    // Get PRO profile for username
    const profiles = await sql`
      SELECT username FROM profiles WHERE id = ${userId}
    `
    const proUsername = profiles[0]?.username || 'PRO'

    // Add system message to order
    await sql`
      INSERT INTO order_messages (order_id, sender_id, message, is_system)
      VALUES (${orderId}, ${userId}, ${'Order accepted by ' + proUsername + '. Work will begin shortly.'}, true)
    `

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: "Order accepted successfully" 
    })
  } catch (error) {
    console.error("[v0] Error in accept order API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
