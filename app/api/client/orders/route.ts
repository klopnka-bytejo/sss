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

    // Fetch all orders for the client using ACTUAL schema columns
    // orders: id, order_number, client_id, pro_id, service_id, amount_cents, status, payment_method, stripe_payment_id, created_at, updated_at
    // pro_profiles: id, user_id, status, bio, expertise, hourly_rate_cents, total_earnings_cents, verified_at, created_at, updated_at
    // NO rating, NO total_orders in pro_profiles
    const orders = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.client_id,
        o.pro_id,
        o.service_id,
        o.amount_cents,
        o.status,
        o.payment_method,
        o.stripe_payment_id,
        o.created_at,
        o.updated_at,
        s.title as service_title,
        s.category as service_category,
        p.display_name as pro_name,
        p.avatar_url as pro_avatar
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN profiles p ON o.pro_id = p.id
      WHERE o.client_id = ${userId}
      ORDER BY o.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ orders: orders || [], success: true })
  } catch (error) {
    console.error('[v0] Client Orders API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 })
  }
}
