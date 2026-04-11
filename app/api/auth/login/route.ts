import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'
import { verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Try to find user in database
    const users = await sql`
      SELECT id, email, display_name, role, password_hash
      FROM profiles 
      WHERE email = ${email}
    `

    if (!users || users.length === 0) {
      console.log('[v0] Login: User not found:', email)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = users[0]
    console.log('[v0] Login: User found, email:', user.email, 'role:', user.role)

    // If admin role requested, verify user is admin
    if (role === 'admin' && user.role !== 'admin') {
      console.log('[v0] Login: Access denied - not admin')
      return NextResponse.json({ error: 'Access denied. Admin credentials required.' }, { status: 403 })
    }

    // Verify password
    if (!user.password_hash) {
      console.log('[v0] Login: No password hash for user:', email)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      console.log('[v0] Login: Invalid password for user:', email)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    console.log('[v0] Login: Login successful for user:', email, 'role:', user.role)
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role
      },
      message: 'Login successful' 
    })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
