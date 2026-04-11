import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    console.log('[v0] Admin review approve: reviewId =', reviewId)

    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const adminCheck = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 403 })
    }

    // Approve the review
    console.log('[v0] Admin review approve: Updating review status')
    await sql`
      UPDATE reviews 
      SET moderation_status = 'approved', updated_at = NOW()
      WHERE id = ${reviewId}
    `

    // Log action
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${userId}, 'review_approved', 'review', ${reviewId}, ${JSON.stringify({
        action: 'approved'
      })}, NOW())
    `

    console.log('[v0] Admin review approve: SUCCESS')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Admin review approve error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ 
      error: 'Failed to approve review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
