import { sql } from '@/lib/neon/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceId, clientNotes, requirements } = await request.json()

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    // Get service details
    const services = await sql`
      SELECT * FROM services WHERE id = ${serviceId}
    `

    if (!services || services.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const service = services[0]

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const platformFee = Math.floor(service.base_price_cents * 0.1) // 10% platform fee
    const proPayout = service.base_price_cents - platformFee

    const order = await sql`
      INSERT INTO orders (
        order_number, client_id, service_id, status, amount_cents, 
        platform_fee_cents, pro_payout_cents, client_notes, requirements,
        created_at, updated_at
      ) VALUES (
        ${orderNumber}, ${userId}, ${serviceId}, 'pending',
        ${service.base_price_cents}, ${platformFee}, ${proPayout},
        ${clientNotes || ''}, ${JSON.stringify(requirements || {})},
        NOW(), NOW()
      )
      RETURNING *
    `

    // Create system message
    await sql`
      INSERT INTO order_messages (
        order_id, sender_id, content, message_type, is_system
      ) VALUES (
        ${order[0].id}, ${userId}, 'Order created', 'system', true
      )
    `

    return NextResponse.json({ order: order[0] }, { status: 201 })
  } catch (error) {
    console.error('[v0] Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
