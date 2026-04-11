import { sql } from '@/lib/neon/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all orders where user is the client
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
        s.description as service_description,
        s.price_cents,
        p.display_name as pro_name,
        p.email as pro_email,
        p.avatar_url as pro_avatar
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN profiles p ON o.pro_id = p.id
      WHERE o.client_id = ${userId}
      ORDER BY o.created_at DESC
    `

    return NextResponse.json({ orders: orders || [], success: true })
  } catch (error) {
    console.error('[v0] My orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders', success: false }, { status: 500 })
  }
}
