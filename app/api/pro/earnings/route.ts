import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Helper to verify PRO role from database
async function verifyProRole(userId: string): Promise<boolean> {
  const users = await sql`SELECT role FROM profiles WHERE id = ${userId}`
  return users && users.length > 0 && users[0].role === 'pro'
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify PRO role from database
    const isPro = await verifyProRole(userId)
    if (!isPro) {
      return NextResponse.json({ error: 'Unauthorized - PRO access required' }, { status: 401 })
    }

    // Get profile with wallet balance
    const profiles = await sql`
      SELECT balance_cents, pending_cents, total_earned_cents, total_withdrawn_cents
      FROM profiles
      WHERE id = ${userId}
    `
    const profile = profiles[0] || {}

    // Get pending earnings (orders completed but not released)
    const pendingOrders = await sql`
      SELECT COALESCE(SUM(pro_payout_cents), 0) as pending
      FROM orders
      WHERE pro_id = ${userId}
      AND status = 'pending_review'
    `

    // Get total earnings from completed/released orders
    const completedOrders = await sql`
      SELECT COALESCE(SUM(pro_payout_cents), 0) as total
      FROM orders
      WHERE pro_id = ${userId}
      AND status IN ('completed', 'released')
    `

    // Get recent transactions
    const transactions = await sql`
      SELECT id, type, amount_cents, description, created_at, order_id
      FROM transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    // Get withdrawals - check if table exists first
    let withdrawals: any[] = []
    try {
      const withdrawalData = await sql`
        SELECT id, amount_cents, status, created_at, processed_at
        FROM withdrawals
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 20
      `
      withdrawals = withdrawalData || []
    } catch (e) {
      // withdrawals table may not exist
      withdrawals = []
    }

    return NextResponse.json({
      balance: profile.balance_cents || 0,
      pendingBalance: pendingOrders[0]?.pending || 0,
      totalEarnings: completedOrders[0]?.total || profile.total_earned_cents || 0,
      totalWithdrawn: profile.total_withdrawn_cents || 0,
      transactions: transactions || [],
      withdrawals: withdrawals,
    })
  } catch (error) {
    console.error('[v0] PRO earnings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
