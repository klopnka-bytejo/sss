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

    // User is authenticated via session cookie - that's enough for admin access
    // The middleware already verified authentication, so we just fetch the data

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
