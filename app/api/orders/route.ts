import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate total amount
    let totalAmountCents = 0
    items.forEach((item: any) => {
      totalAmountCents += item.price_cents * item.quantity
    })

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order in database using ACTUAL schema columns:
    // id, order_number, client_id, pro_id, service_id, amount_cents, status, payment_method, stripe_payment_id, created_at, updated_at
    // Note: pro_id is required, so we use a placeholder UUID that will be replaced when a PRO is assigned
    const result = await sql`
      INSERT INTO orders (
        order_number,
        client_id,
        pro_id,
        service_id,
        amount_cents,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${orderNumber},
        ${userId},
        '00000000-0000-0000-0000-000000000000',
        ${items[0].serviceId},
        ${totalAmountCents},
        'pending_assignment',
        NOW(),
        NOW()
      )
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const order = result[0]

    // Log to audit log
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${userId}, 'order_created', 'order', ${order.id}, ${JSON.stringify({
        client_id: userId,
        amount_cents: totalAmountCents,
        items_count: items.length
      })}, NOW())
    `

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        amount_cents: order.amount_cents,
        created_at: order.created_at
      }
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all orders for client
    const orders = await sql`
      SELECT * FROM orders
      WHERE client_id = ${userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('[v0] Fetch orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

