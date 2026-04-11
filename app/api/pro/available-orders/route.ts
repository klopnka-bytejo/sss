import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Helper to verify PRO role from database
async function verifyProRole(userId: string): Promise<boolean> {
  const users = await sql`SELECT role FROM profiles WHERE id = ${userId}`
  return users && users.length > 0 && users[0].role === 'pro'
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify PRO role from database
    const isPro = await verifyProRole(userId)
    if (!isPro) {
      return NextResponse.json({ error: 'Unauthorized - PRO access required' }, { status: 401 })
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
