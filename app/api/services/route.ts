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

    // Fetch all services with PRO info
    const services = await sql`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.category,
        s.game,
        s.price_cents,
        s.delivery_time,
        s.is_active,
        s.created_at,
        p.id as pro_id,
        p.display_name as pro_name,
        p.avatar_url as pro_avatar,
        pp.rating,
        pp.total_orders,
        pp.completion_rate
      FROM services s
      LEFT JOIN profiles p ON s.pro_id = p.id
      LEFT JOIN pro_profiles pp ON p.id = pp.user_id
      WHERE s.is_active = true
      ORDER BY pp.rating DESC NULLS LAST
      LIMIT 100
    `

    console.log('[v0] Services API - found services:', services?.length || 0)
    return NextResponse.json({ services: services || [] })
  } catch (error) {
    console.error('[v0] Services API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
