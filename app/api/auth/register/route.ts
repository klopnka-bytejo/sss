import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'
import { hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role } = await request.json()

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM profiles WHERE email = ${email}
    `

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const userId = uuidv4()
    const userRole = role === 'pro' ? 'pro' : 'client'

    const result = await sql`
      INSERT INTO profiles (id, email, display_name, role, password_hash, created_at, updated_at)
      VALUES (${userId}, ${email}, ${displayName}, ${userRole}, ${hashedPassword}, NOW(), NOW())
      RETURNING id, email, display_name, role
    `

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json({ 
      user: result[0],
      message: 'Registration successful' 
    })
  } catch (error) {
    console.error('[v0] Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
