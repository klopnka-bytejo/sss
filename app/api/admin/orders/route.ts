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

    // User is authenticated via session cookie - that's enough for admin access
    // Fetch all orders with complete related data
    const orders = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.amount_cents,
        o.platform_fee_cents,
        o.pro_payout_cents,
        o.status,
        o.payment_status,
        o.payment_method,
        o.notes,
        o.created_at,
        o.updated_at,
        c.email as client_email,
        c.display_name as client_name,
        p.email as pro_email,
        p.display_name as pro_name,
        s.title as service_title,
        s.category as service_category,
        s.price_cents as service_price
      FROM orders o
      LEFT JOIN profiles c ON o.client_id = c.id
      LEFT JOIN profiles p ON o.pro_id = p.id
      LEFT JOIN services s ON o.service_id = s.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `

    console.log('[v0] Admin orders API - found orders:', orders?.length || 0)
    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('[v0] Admin orders API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, action, newStatus, proId } = await request.json()

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'update_status' && newStatus) {
      await sql`
        UPDATE orders 
        SET status = ${newStatus}, updated_at = NOW()
        WHERE id = ${orderId}
      `
    } else if (action === 'assign_pro' && proId) {
      await sql`
        UPDATE orders 
        SET pro_id = ${proId}, updated_at = NOW()
        WHERE id = ${orderId}
      `
    }

    console.log('[v0] Admin orders API - updated order:', orderId, 'action:', action)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Admin orders API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

