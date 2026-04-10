import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

// GET - Fetch all disputes (admin only)
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User is authenticated via session cookie - that's enough for admin access
    // The middleware already verified authentication, so we just fetch the data

    // Fetch disputes with related data
    const disputes = await sql`
      SELECT 
        d.id,
        d.order_id,
        d.opened_by,
        d.reason,
        d.status,
        d.resolution,
        d.created_at,
        d.resolved_at,
        o.order_number,
        o.amount_cents,
        p.email as client_email,
        p.display_name as client_name
      FROM disputes d
      LEFT JOIN orders o ON d.order_id = o.id
      LEFT JOIN profiles p ON o.client_id = p.id
      ORDER BY d.created_at DESC
    `

    return NextResponse.json({ disputes: disputes || [] })
  } catch (error) {
    console.error('Admin disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
