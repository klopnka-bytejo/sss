import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all PRO users
    const pros = await sql`
      SELECT 
        p.id,
        p.email,
        p.display_name as username,
        p.role,
        pp.status,
        p.created_at,
        p.balance_cents,
        p.total_earned_cents,
        pp.total_orders as completed_orders,
        pp.rating,
        pp.total_reviews
      FROM profiles p
      LEFT JOIN pro_profiles pp ON p.id = pp.user_id
      WHERE p.role = 'pro'
      ORDER BY p.created_at DESC
    `

    return NextResponse.json({ pros: pros || [] })
  } catch (error) {
    console.error('PROs error:', error)
    return NextResponse.json({ error: 'Failed to fetch PROs' }, { status: 500 })
  }
}
