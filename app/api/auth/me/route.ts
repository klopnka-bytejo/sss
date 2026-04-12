import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ user: null })
    }

    // Query database for full user profile data
    const users = await sql`
      SELECT id, email, display_name, username, avatar_url, balance_cents, role 
      FROM profiles 
      WHERE id = ${userId}
    `

    if (!users || users.length === 0) {
      return NextResponse.json({ user: null })
    }

    console.log('[v0] Auth ME: User authenticated:', users[0].id, 'Role:', users[0].role)
    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error('[v0] Get user error:', error)
    return NextResponse.json({ user: null })
  }
}
