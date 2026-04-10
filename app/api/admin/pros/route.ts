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

    // Get all PRO users with their profiles
    const pros = await sql`
      SELECT 
        p.id,
        p.email,
        p.display_name,
        p.avatar_url,
        p.country,
        pp.bio,
        pp.rating,
        pp.total_orders,
        pp.completion_rate,
        pp.games
      FROM profiles p
      LEFT JOIN pro_profiles pp ON p.id = pp.user_id
      WHERE p.role = 'pro'
      ORDER BY pp.rating DESC NULLS LAST
      LIMIT 100
    `

    console.log('[v0] Admin PROs API - found PROs:', pros?.length || 0)
    return NextResponse.json({ pros: pros || [] })
  } catch (error) {
    console.error('[v0] Admin PROs API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

