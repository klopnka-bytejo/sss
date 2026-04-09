import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all orders with related data
    const orders = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.client_id,
        o.pro_id,
        o.service_id,
        o.status,
        o.total_cents,
        o.payment_method,
        o.payment_status,
        o.created_at,
        o.updated_at,
        p.email as client_email,
        p.username as client_name,
        s.title as service_title
      FROM orders o
      LEFT JOIN profiles p ON o.client_id = p.id
      LEFT JOIN services s ON o.service_id = s.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
