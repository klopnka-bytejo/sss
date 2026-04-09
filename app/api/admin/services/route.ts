import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get("gameId")

    let services
    if (gameId) {
      services = await sql`
        SELECT * FROM services 
        WHERE game_id = ${gameId}
        ORDER BY created_at DESC
      `
    } else {
      services = await sql`
        SELECT * FROM services ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ services: services || [] })
  } catch (error) {
    console.error('Services error:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}
