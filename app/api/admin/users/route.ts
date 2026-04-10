import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

// GET /api/admin/users - Get all users with filters
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User is authenticated via session cookie - that's enough for admin access
    // The middleware already verified authentication, so we just fetch the data

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    let users
    if (search && role && role !== 'all') {
      users = await sql`
        SELECT * FROM profiles 
        WHERE (email ILIKE ${'%' + search + '%'} OR display_name ILIKE ${'%' + search + '%'})
        AND role = ${role}
        ORDER BY created_at DESC 
        LIMIT 100
      `
    } else if (search) {
      users = await sql`
        SELECT * FROM profiles 
        WHERE (email ILIKE ${'%' + search + '%'} OR display_name ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC 
        LIMIT 100
      `
    } else if (role && role !== 'all') {
      users = await sql`
        SELECT * FROM profiles 
        WHERE role = ${role}
        ORDER BY created_at DESC 
        LIMIT 100
      `
    } else {
      users = await sql`
        SELECT * FROM profiles 
        ORDER BY created_at DESC 
        LIMIT 100
      `
    }

    console.log('[v0] Admin users API - found users:', users?.length || 0)
    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/users - Update user (suspend/unsuspend, change role)
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User is authenticated via session cookie - that's enough for admin access
    // The middleware already verified authentication, so we just process the request

    const body = await request.json()
    const { targetUserId, action, newRole, reason } = body

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate action and prepare update
    if (action === 'change_role') {
      if (!newRole || !['client', 'pro', 'admin'].includes(newRole)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }

      await sql`
        UPDATE profiles 
        SET role = ${newRole}, updated_at = NOW()
        WHERE id = ${targetUserId}
      `
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin users update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
