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

    // Verify admin role
    const adminCheck = await sql`SELECT role FROM profiles WHERE id = ${userId}`
    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Query the correct table: pro_applications with correct column names
    let applications
    if (status && status !== 'all') {
      applications = await sql`
        SELECT 
          id, user_id, email, display_name, discord,
          games, experience, achievements, status,
          admin_notes, reviewed_by, reviewed_at, created_at, updated_at
        FROM pro_applications 
        WHERE status = ${status}
        ORDER BY created_at DESC
      `
    } else {
      applications = await sql`
        SELECT 
          id, user_id, email, display_name, discord,
          games, experience, achievements, status,
          admin_notes, reviewed_by, reviewed_at, created_at, updated_at
        FROM pro_applications 
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    console.error('Applications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
