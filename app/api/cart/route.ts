import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'Cart checkout endpoint',
      documentation: 'POST to /api/cart to create order from cart'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve cart' },
      { status: 500 }
    )
  }
}

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
    const validMethods = ['cash', 'credit_card', 'paypal']
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    // Calculate total
    let totalCents = 0
    for (const item of items) {
      totalCents += item.price * item.quantity * 100 // Convert to cents
    }

    // Create order
    const orderNumber = `ORD-${Date.now()}`
    const firstServiceId = items[0].id || '00000000-0000-0000-0000-000000000001'
    
    const order = await sql`
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
        ${firstServiceId},
        ${totalCents},
        'completed',
        ${paymentMethod},
        NOW(),
        NOW()
      )
      RETURNING id, order_number, amount_cents, status, created_at
    `

    if (!order || order.length === 0) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const orderId = order[0].id

    // Add items to order_items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id,
          item_type,
          item_id,
          name,
          price_cents,
          quantity
        ) VALUES (
          ${orderId},
          ${item.type},
          ${item.id},
          ${item.name},
          ${Math.round(item.price * 100)},
          ${item.quantity}
        )
      `
    }

    return NextResponse.json({
      success: true,
      order: order[0],
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('[v0] Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Cart cleared'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}

