import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Helper to verify PRO role from database
async function verifyProRole(userId: string): Promise<boolean> {
  const users = await sql`SELECT role FROM profiles WHERE id = ${userId}`
  return users && users.length > 0 && users[0].role === 'pro'
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify PRO role from database (more secure than cookie)
    const isPro = await verifyProRole(userId)
    if (!isPro) {
      return NextResponse.json({ error: 'Unauthorized - PRO access required' }, { status: 401 })
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
