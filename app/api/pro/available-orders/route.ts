import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    const userRole = cookieStore.get('user_role')?.value

    if (!userId || userRole !== 'pro') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get available orders (paid but not assigned to any PRO)
    const orders = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.total_cents,
        o.amount_cents,
        o.status,
        o.notes,
        o.created_at,
        s.id as service_id,
        s.title as service_title,
        s.description as service_description,
        s.game as service_game,
        s.category as service_category,
        s.delivery_time as estimated_hours
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      WHERE o.status = 'paid'
      AND o.pro_id IS NULL
      ORDER BY o.created_at ASC
    `

    // Get active games for filtering
    const games = await sql`
      SELECT id, name
      FROM games
      WHERE is_active = true
      ORDER BY name
    `

    return NextResponse.json({
      orders: orders || [],
      games: games || [],
    })
  } catch (error) {
    console.error('[v0] Available orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available orders' },
      { status: 500 }
    )
  }
}
