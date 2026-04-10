import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all orders for the client with service and PRO info
    const orders = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.service_id,
        o.pro_id,
        o.amount_cents,
        o.platform_fee_cents,
        o.pro_payout_cents,
        o.status,
        o.payment_status,
        o.notes,
        o.created_at,
        o.updated_at,
        s.title as service_title,
        s.category as service_category,
        s.game as service_game,
        s.delivery_time,
        p.display_name as pro_name,
        p.avatar_url as pro_avatar,
        pp.rating as pro_rating,
        pp.total_orders as pro_total_orders
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN profiles p ON o.pro_id = p.id
      LEFT JOIN pro_profiles pp ON p.id = pp.user_id
      WHERE o.client_id = ${userId}
      ORDER BY o.created_at DESC
      LIMIT 50
    `

    console.log('[v0] Client Orders API - found orders:', orders?.length || 0)
    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('[v0] Client Orders API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
