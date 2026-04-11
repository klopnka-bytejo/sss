import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const gameSlug = searchParams.get('slug')

    let services
    
    if (gameId) {
      services = await sql`
        SELECT 
          gs.id,
          gs.game_id,
          gs.name,
          gs.description,
          gs.pricing_type,
          gs.base_price_cents,
          gs.delivery_time,
          gs.category,
          gs.is_active,
          g.name as game_name,
          g.slug as game_slug
        FROM game_services gs
        JOIN games g ON gs.game_id = g.id
        WHERE gs.game_id = ${gameId} AND gs.is_active = true
        ORDER BY gs.sort_order ASC, gs.name ASC
      `
    } else if (gameSlug) {
      services = await sql`
        SELECT 
          gs.id,
          gs.game_id,
          gs.name,
          gs.description,
          gs.pricing_type,
          gs.base_price_cents,
          gs.delivery_time,
          gs.category,
          gs.is_active,
          g.name as game_name,
          g.slug as game_slug
        FROM game_services gs
        JOIN games g ON gs.game_id = g.id
        WHERE g.slug = ${gameSlug} AND gs.is_active = true
        ORDER BY gs.sort_order ASC, gs.name ASC
      `
    } else {
      services = await sql`
        SELECT 
          gs.id,
          gs.game_id,
          gs.name,
          gs.description,
          gs.pricing_type,
          gs.base_price_cents,
          gs.delivery_time,
          gs.category,
          gs.is_active,
          g.name as game_name,
          g.slug as game_slug
        FROM game_services gs
        JOIN games g ON gs.game_id = g.id
        WHERE gs.is_active = true
        ORDER BY g.sort_order ASC, gs.sort_order ASC
      `
    }

    return NextResponse.json({ services: services || [], success: true })
  } catch (error) {
    console.error('[v0] Get game services error:', error)
    return NextResponse.json({ error: 'Failed to fetch services', services: [] }, { status: 500 })
  }
}
