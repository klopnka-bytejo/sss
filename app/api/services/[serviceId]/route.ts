import { sql } from '@/lib/neon/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params

    const services = await sql`
      SELECT 
        s.*,
        g.name as game_name,
        g.slug as game_slug
      FROM services s
      LEFT JOIN games g ON s.game_id = g.id
      WHERE s.id = ${serviceId} AND s.is_active = true
    `

    if (!services || services.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ service: services[0] })
  } catch (error) {
    console.error('[v0] Get service error:', error)
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
  }
}
