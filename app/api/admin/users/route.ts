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

    // Build query with filters
    let query = 'SELECT * FROM profiles WHERE 1=1'
    const params: any[] = []

    if (role && role !== 'all') {
      query += ' AND role = $' + (params.length + 1)
      params.push(role)
    }

    if (search) {
      query += ' AND (email ILIKE $' + (params.length + 1) + ' OR username ILIKE $' + (params.length + 2) + ')'
      params.push(`%${search}%`)
      params.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC LIMIT 100'

    const users = params.length > 0 
      ? await sql(query, params)
      : await sql(query)

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
    let updateQuery = 'UPDATE profiles SET'
    const params: any[] = []

    switch (action) {
      case 'change_role':
        if (!newRole || !['client', 'pro', 'admin'].includes(newRole)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }
        updateQuery += ' role = $1'
        params.push(newRole)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    updateQuery += ' WHERE id = $' + (params.length + 1)
    params.push(targetUserId)

    await sql(updateQuery, params)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin users update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
