import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'
import { verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()
    console.log('[v0] Login attempt:', { email, hasPassword: !!password, role })

    if (!email || !password) {
      console.log('[v0] Missing email or password')
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Check for hardcoded admin credentials first (temporary solution)
    console.log('[v0] Checking hardcoded admin:', { 
      emailMatch: email === 'sanad.nassar@hotmail.com',
      passwordMatch: password === 'asdasx555',
      roleMatch: role === 'admin'
    })
    
    if (email === 'sanad.nassar@hotmail.com' && password === 'asdasx555' && role === 'admin') {
      console.log('[v0] Hardcoded admin credentials matched!')
      const cookieStore = await cookies()
      
      // Use a specific ID that represents the hardcoded admin
      const adminId = 'admin-hardcoded-user'
      
      cookieStore.set('user_id', adminId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })

      console.log('[v0] Admin login successful, returning response')
      return NextResponse.json({ 
        user: {
          id: adminId,
          email: 'sanad.nassar@hotmail.com',
          display_name: 'Admin',
          role: 'admin'
        },
        message: 'Login successful' 
      })
    }

    console.log('[v0] Hardcoded credentials did not match, trying database...')
    // Otherwise, try to find user in database
    try {
      const users = await sql`
        SELECT id, email, display_name, role, password_hash
        FROM profiles 
        WHERE email = ${email}
      `

      if (!users || users.length === 0) {
        console.log('[v0] No user found in database with email:', email)
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const user = users[0]
      console.log('[v0] User found in database:', { id: user.id, email: user.email, role: user.role })

      // If admin role requested, verify user is admin
      if (role === 'admin' && user.role !== 'admin') {
        console.log('[v0] User is not admin')
        return NextResponse.json({ error: 'Access denied. Admin credentials required.' }, { status: 403 })
      }

      // Verify password
      if (user.password_hash) {
        const isValid = await verifyPassword(password, user.password_hash)
        if (!isValid) {
          console.log('[v0] Password verification failed')
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }
      }

      // Create session cookie
      const cookieStore = await cookies()
      cookieStore.set('user_id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })

      console.log('[v0] Database user login successful')
      return NextResponse.json({ 
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role
        },
        message: 'Login successful' 
      })
    } catch (dbError) {
      console.error('[v0] Database query error:', dbError)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
