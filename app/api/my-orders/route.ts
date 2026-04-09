import { sql } from '@/lib/neon/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all orders where user is the client
    const orders = await sql`
      SELECT 
        o.*,
        s.title as service_title,
        s.description as service_description,
        s.price_cents,
        p.display_name as pro_name,
        p.email as pro_email
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN profiles p ON o.pro_id = p.id
      WHERE o.client_id = ${userId}
      ORDER BY o.created_at DESC
    `

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('[v0] My orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
