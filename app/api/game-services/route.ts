import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameSlug = searchParams.get('slug')

    // If no slug provided, return all active services
    if (!gameSlug) {
      const services = await sql`
        SELECT 
          s.id,
          s.title,
          s.description,
          s.price_cents,
          s.duration_minutes,
          s.category,
          p.display_name as pro_name,
          p.avatar_url as pro_avatar
        FROM services s
        LEFT JOIN profiles p ON s.user_id = p.id
        WHERE s.active = true
        ORDER BY s.created_at DESC
        LIMIT 50
      `
      
      return NextResponse.json({ 
        services: services || [], 
        success: true 
      })
    }

    // Get game by slug
    const gameResult = await sql`
      SELECT id, name, slug, logo_url, banner_url, description
      FROM games
      WHERE slug = ${gameSlug} AND is_active = true
    `

    // If game not found, return 404 with empty services
    if (!gameResult || gameResult.length === 0) {
      return NextResponse.json({ 
        error: 'Game not found',
        services: [],
        game: null
      }, { status: 404 })
    }

    const game = gameResult[0]

    // Get services related to this game
    // Since there's no game_id in services, we return popular services
    const services = await sql`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.price_cents,
        s.duration_minutes,
        s.category,
        p.display_name as pro_name,
        p.avatar_url as pro_avatar
      FROM services s
      LEFT JOIN profiles p ON s.user_id = p.id
      WHERE s.active = true
      ORDER BY s.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({ 
      game,
      services: services || [], 
      success: true 
    })
  } catch (error) {
    console.error('[v0] Get game services error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch services', 
      services: [],
      success: false
    }, { status: 500 })
  }
}
