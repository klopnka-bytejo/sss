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

    // Check if admin
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    let users
    if (search) {
      users = await sql`
        SELECT * FROM profiles 
        WHERE (email ILIKE ${`%${search}%`} OR display_name ILIKE ${`%${search}%`})
        ${role && role !== 'all' ? sql`AND role = ${role}` : sql``}
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

    // Check if admin
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
