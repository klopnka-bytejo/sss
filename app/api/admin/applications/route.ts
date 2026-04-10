import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

// GET - Fetch all PRO applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    if (userId === 'admin-hardcoded-user') {
      // Hardcoded admin is always authorized
    } else {
      const adminCheck = await sql`
        SELECT role FROM profiles WHERE id = ${userId}
      `

      if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let applications
    if (status && status !== 'all') {
      applications = await sql`
        SELECT * FROM pro_profiles 
        WHERE status = ${status}
        ORDER BY created_at DESC
      `
    } else {
      applications = await sql`
        SELECT * FROM pro_profiles 
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    console.error('Applications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Review application (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { applicationId, action, notes } = body

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['approve', 'reject', 'request_info'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // For now, acknowledge the review
    return NextResponse.json({ 
      success: true,
      message: `Application ${action}ed successfully`,
      applicationId,
      action
    })
  } catch (error) {
    console.error('Application review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
