import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/pro/availability - Get PRO's availability settings
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    const userRole = cookieStore.get('user_role')?.value

    if (!userId || userRole !== 'pro') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile with availability settings and metadata
    const profiles = await sql`
      SELECT metadata, availability_settings
      FROM profiles
      WHERE id = ${userId}
    `
    const profile = profiles[0] || {}

    // Get active games
    const games = await sql`
      SELECT id, name
      FROM games
      WHERE is_active = true
      ORDER BY name
    `

    return NextResponse.json({
      settings: profile.availability_settings || {},
      metadata: profile.metadata || {},
      games: games || [],
    })
  } catch (error) {
    console.error('[v0] PRO availability error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/pro/availability - Update PRO's availability settings
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    const userRole = cookieStore.get('user_role')?.value

    if (!userId || userRole !== 'pro') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update profile with availability settings stored in metadata
    await sql`
      UPDATE profiles
      SET 
        metadata = ${JSON.stringify(body)}::jsonb,
        updated_at = NOW()
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] PRO availability update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
