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

    // Create profile
    const profile = await sql`
      INSERT INTO profiles (
        email, display_name, role, password_hash, created_at
      ) VALUES (
        ${application.email}, ${application.full_name}, 'pro', ${application.password_hash}, NOW()
      )
      RETURNING *
    `

    // Create pro_profiles entry
    await sql`
      INSERT INTO pro_profiles (
        user_id, display_name, bio, games, experience_level,
        contact_email, discord_username, gamer_tag, country,
        status, rating, total_reviews, total_orders, created_at
      ) VALUES (
        ${profile[0].id}, ${application.full_name}, ${application.bio},
        ${application.games}, ${application.years_of_experience},
        ${application.email}, ${application.discord_username}, ${application.gamer_tag},
        ${application.country}, 'active', 0, 0, 0, NOW()
      )
    `

    // Update application status
    await sql`
      UPDATE pro_applications
      SET status = 'approved', reviewed_at = NOW(), reviewed_by = ${userId}
      WHERE id = ${id}
    `

    console.log('[v0] Application approved:', { id, email: application.email })

    return NextResponse.json({
      success: true,
      message: 'Application approved successfully',
      profile: profile[0]
    })
  } catch (error) {
    console.error('[v0] Approve application error:', error)
    return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 })
  }
}
