import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const logs = await sql`
      SELECT 
        al.id,
        al.admin_id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.created_at,
        p.display_name as admin_name,
        p.email
      FROM admin_audit_log al
      LEFT JOIN profiles p ON al.admin_id = p.id
      ORDER BY al.created_at DESC
      LIMIT 500
    `

    return NextResponse.json({ logs: logs || [] })
  } catch (error) {
    console.error('Audit log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
