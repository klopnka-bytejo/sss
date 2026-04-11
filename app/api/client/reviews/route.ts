import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Client reviews API: START')
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Client reviews API: userId =', userId)

    if (!userId) {
      console.log('[v0] Client reviews API: No userId - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all reviews submitted by this client
    console.log('[v0] Client reviews API: Fetching reviews submitted by client')
    const reviews = await sql`
      SELECT 
        r.id,
        r.rating,
        r.title,
        r.comment,
        r.created_at,
        r.order_id,
        o.order_number,
        p.display_name as pro_name,
        p.avatar_url as pro_avatar,
        s.title as service_title
      FROM reviews r
      JOIN orders o ON r.order_id = o.id
      JOIN profiles p ON r.pro_id = p.id
      JOIN services s ON o.service_id = s.id
      WHERE r.client_id = ${userId}
      ORDER BY r.created_at DESC
      LIMIT 100
    `

    console.log('[v0] Client reviews API: Found', reviews?.length || 0, 'reviews')

    return NextResponse.json({
      reviews: reviews || [],
      success: true
    })
  } catch (error) {
    console.error('[v0] Client reviews API error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('[v0] Client reviews API stack:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Failed to fetch reviews', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
