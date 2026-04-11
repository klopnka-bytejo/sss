import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'
import { hashPassword } from '@/lib/auth'
import type { UserRole } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role } = await request.json()

    console.log('[v0] Signup: Attempting signup with email:', email, 'role:', role)

    if (!email || !password || !displayName) {
      console.log('[v0] Signup: Missing required fields')
      return NextResponse.json({ error: 'Email, password, and display name are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM profiles WHERE email = ${email}
    `

    if (existingUsers && existingUsers.length > 0) {
      console.log('[v0] Signup: User already exists with email:', email)
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    console.log('[v0] Signup: Password hashed, creating user')

    // Create user
    const users = await sql`
      INSERT INTO profiles (email, display_name, role, password_hash)
      VALUES (${email}, ${displayName}, ${role}, ${passwordHash})
      RETURNING id, email, display_name, role
    `

    if (!users || users.length === 0) {
      console.log('[v0] Signup: Failed to create user')
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    const user = users[0]
    console.log('[v0] Signup: User created successfully:', user.id)

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    console.log('[v0] Signup: Session cookie set')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
      },
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('[v0] Signup error:', error instanceof Error ? error.message : error)
    if (error instanceof Error) {
      console.error('[v0] Signup stack:', error.stack)
    }
    return NextResponse.json({ error: 'An unexpected error occurred during signup' }, { status: 500 })
  }
}
