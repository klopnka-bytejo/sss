import { sql } from '@/lib/neon/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceId, notes } = await request.json()

    if (!serviceId) {
      return NextResponse.json({ error: 'Missing serviceId' }, { status: 400 })
    }

    // Get service details
    const service = await sql`
      SELECT id, pro_id, price_cents FROM services WHERE id = ${serviceId} AND is_active = true
    `

    if (!service || service.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const platformFeeCents = Math.round(service[0].price_cents * 0.1) // 10% platform fee
    const proPayoutCents = service[0].price_cents - platformFeeCents

    // Create order
    const order = await sql`
      INSERT INTO orders (
        client_id,
        pro_id,
        service_id,
        order_number,
        amount_cents,
        platform_fee_cents,
        pro_payout_cents,
        status,
        payment_status,
        payment_method,
        notes,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${service[0].pro_id},
        ${serviceId},
        ${orderNumber},
        ${service[0].price_cents},
        ${platformFeeCents},
        ${proPayoutCents},
        'pending',
        'pending',
        'stripe',
        ${notes || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    console.log('[v0] Checkout API - created order:', orderNumber)
    return NextResponse.json({ order: order[0], success: true })
  } catch (error) {
    console.error('[v0] Checkout API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
