import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function GET() {
  try {
    const games = await sql`
      SELECT 
        id,
        name,
        slug,
        description,
        logo_url,
        banner_url,
        is_active,
        sort_order,
        created_at
      FROM games
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `

    return NextResponse.json({ games: games || [], success: true })
  } catch (error) {
    console.error('[v0] Get games error:', error)
    return NextResponse.json({ error: 'Failed to fetch games', games: [] }, { status: 500 })
  }
}
