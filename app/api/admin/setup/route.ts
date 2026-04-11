import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'
import { hashPassword } from '@/lib/auth'

// This endpoint creates a test admin user
// Only works if no admin user exists in the database
export async function POST() {
  try {
    console.log('[v0] Create Admin endpoint called')

    // Check if admin already exists
    const existingAdmins = await sql`
      SELECT id FROM profiles WHERE role = 'admin' LIMIT 1
    `

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('[v0] Admin user already exists')
      return NextResponse.json({
        error: 'Admin user already exists',
        message: 'Use your existing admin credentials to login'
      }, { status: 400 })
    }

    // Create admin user
    const adminEmail = 'admin@gamingservices.local'
    const adminPassword = 'Admin123!@#'
    const adminPasswordHash = await hashPassword(adminPassword)

    const result = await sql`
      INSERT INTO profiles (
        email,
        password_hash,
        display_name,
        role,
        created_at,
        updated_at
      ) VALUES (
        ${adminEmail},
        ${adminPasswordHash},
        'Platform Admin',
        'admin',
        NOW(),
        NOW()
      )
      RETURNING id, email, display_name, role
    `

    if (!result || result.length === 0) {
      throw new Error('Failed to create admin user')
    }

    console.log('[v0] Admin user created successfully')
    return NextResponse.json({
      success: true,
      user: result[0],
      credentials: {
        email: adminEmail,
        password: adminPassword
      },
      message: 'Admin user created. You can now login at /auth/admin'
    })
  } catch (error) {
    console.error('[v0] Create admin error:', error instanceof Error ? error.message : error)
    return NextResponse.json({
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
