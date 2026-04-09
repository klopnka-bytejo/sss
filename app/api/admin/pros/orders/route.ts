import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    const userRole = cookieStore.get('user_role')?.value

    if (!userId || userRole !== 'pro') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all orders assigned to this PRO
    const orders = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.client_id,
        o.pro_id,
        o.service_id,
        o.amount_cents,
        o.status,
        o.payment_status,
        o.created_at,
        o.updated_at,
        c.display_name as client_name,
        c.email as client_email,
        s.title as service_title
      FROM orders o
      LEFT JOIN profiles c ON o.client_id = c.id
      LEFT JOIN services s ON o.service_id = s.id
      WHERE o.pro_id = ${userId}
      ORDER BY o.created_at DESC
    `

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('[v0] PRO orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
