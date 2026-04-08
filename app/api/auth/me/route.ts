import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ user: null })
    }

    const users = await sql`
      SELECT id, email, display_name, role, avatar_url, balance_cents, created_at
      FROM profiles 
      WHERE id = ${userId}
    `

    if (!users || users.length === 0) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error('[v0] Get user error:', error)
    return NextResponse.json({ user: null })
  }
}
