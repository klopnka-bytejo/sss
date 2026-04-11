import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Admin reviews API: START')
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Admin reviews API: userId =', userId)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      console.log('[v0] Admin reviews API: User is not admin')
      return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 403 })
    }

    // Fetch all reviews with joined data
    console.log('[v0] Admin reviews API: Fetching reviews')
    const reviews = await sql`
      SELECT 
        r.id,
        r.rating,
        r.title,
        r.comment,
        r.created_at,
        r.moderation_status,
        r.is_flagged,
        r.flag_reason,
        r.order_id,
        o.order_number,
        pc.display_name as client_name,
        pc.avatar_url as client_avatar,
        pp.display_name as pro_name,
        pp.avatar_url as pro_avatar
      FROM reviews r
      JOIN orders o ON r.order_id = o.id
      JOIN profiles pc ON r.client_id = pc.id
      JOIN profiles pp ON r.pro_id = pp.id
      ORDER BY r.created_at DESC
      LIMIT 500
    `

    console.log('[v0] Admin reviews API: Found', reviews?.length || 0, 'reviews')

    return NextResponse.json({
      reviews: reviews || [],
      success: true
    })
  } catch (error) {
    console.error('[v0] Admin reviews API error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ 
      error: 'Failed to fetch reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
