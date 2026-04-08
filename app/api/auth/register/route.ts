import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'
import { hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'
import crypto from 'crypto'

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

    // Generate verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase()

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const userId = crypto.randomUUID()
    const userRole = role === 'pro' ? 'pro' : 'client'

    const result = await sql`
      INSERT INTO profiles (id, email, display_name, role, password_hash, metadata, created_at, updated_at)
      VALUES (${userId}, ${email}, ${displayName}, ${userRole}, ${hashedPassword}, 
        ${{ verificationCode, verified: false }}::jsonb, NOW(), NOW())
      RETURNING id, email, display_name, role
    `

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ 
      user: result[0],
      verificationCode,
      message: 'Registration successful. Please verify your email.' 
    })
  } catch (error) {
    console.error('[v0] Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
