import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, paymentMethod } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
    }

    // Validate payment method
    const validMethods = ['credit_card', 'paypal', 'crypto']
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    // Calculate total
    let totalCents = 0
    for (const item of items) {
      totalCents += item.price_cents * (item.quantity || 1)
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Get first service ID for the order (we need this for the orders table constraint)
    const firstServiceId = items[0].service_id

    // Check if we have a valid game_services reference
    let serviceRef = null
    if (firstServiceId) {
      const serviceCheck = await sql`
        SELECT id FROM game_services WHERE id = ${firstServiceId}
      `
      if (serviceCheck && serviceCheck.length > 0) {
        serviceRef = serviceCheck[0].id
      }
    }

    // Create the main order record
    // Note: Using a placeholder for pro_id and service_id since they're required
    const orderResult = await sql`
      INSERT INTO orders (
        order_number,
        client_id,
        pro_id,
        service_id,
        amount_cents,
        status,
        payment_method,
        created_at,
        updated_at
      ) VALUES (
        ${orderNumber},
        ${userId},
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000001',
        ${totalCents},
        'pending',
        ${paymentMethod},
        NOW(),
        NOW()
      )
      RETURNING id, order_number, amount_cents, status, created_at
    `

    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const order = orderResult[0]

    // Add items to order_items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id,
          service_id,
          item_type,
          item_name,
          selected_options,
          quantity,
          price_cents
        ) VALUES (
          ${order.id},
          ${item.service_id || null},
          ${item.type || 'service'},
          ${item.name},
          ${JSON.stringify(item.selected_options || {})},
          ${item.quantity || 1},
          ${item.price_cents}
        )
      `
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total: order.amount_cents,
        status: order.status,
        created_at: order.created_at
      },
      message: 'Order placed successfully!'
    })
  } catch (error) {
    console.error('[v0] Create order error:', error)
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
