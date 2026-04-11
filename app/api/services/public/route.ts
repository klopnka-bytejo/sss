import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function GET() {
  try {
    const services = await sql`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.price_cents,
        s.duration_minutes,
        s.category,
        s.user_id,
        s.created_at,
        p.display_name as provider_name,
        p.avatar_url as provider_avatar
      FROM services s
      LEFT JOIN profiles p ON s.user_id = p.id
      WHERE s.active = true
      ORDER BY s.created_at DESC
      LIMIT 100
    `

    return NextResponse.json({ services: services || [], success: true })
  } catch (error) {
    console.error('[v0] Get services error:', error)
    return NextResponse.json({ error: 'Failed to fetch services', services: [] }, { status: 500 })
  }
}
