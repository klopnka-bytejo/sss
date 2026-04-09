import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin
    const admin = await sql`
      SELECT role FROM profiles WHERE id = ${userId}
    `

    if (!admin || admin.length === 0 || admin[0].role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get application
    const applications = await sql`
      SELECT * FROM pro_applications WHERE id = ${id}
    `

    if (!applications || applications.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const application = applications[0]

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application already processed' }, { status: 400 })
    }

    // Update application status
    await sql`
      UPDATE pro_applications
      SET status = 'rejected', reviewed_at = NOW(), reviewed_by = ${userId}
      WHERE id = ${id}
    `

    console.log('[v0] Application rejected:', { id, email: application.email })

    return NextResponse.json({
      success: true,
      message: 'Application rejected successfully'
    })
  } catch (error) {
    console.error('[v0] Reject application error:', error)
    return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 })
  }
}
