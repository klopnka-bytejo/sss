import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'
import { hashPassword } from '@/lib/auth'

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

    // Verify admin role
    const adminCheck = await sql`SELECT role FROM profiles WHERE id = ${userId}`
    if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, admin_notes, password } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be approve or reject.' }, { status: 400 })
    }

    if (action === 'approve' && (!password || password.length < 6)) {
      return NextResponse.json({ error: 'A password of at least 6 characters is required to approve.' }, { status: 400 })
    }

    // Fetch the application using correct column names
    const apps = await sql`
      SELECT id, email, display_name, discord, games, experience, achievements, status
      FROM pro_applications 
      WHERE id = ${id}
    `

    if (!apps || apps.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const app = apps[0]

    if (app.status !== 'pending') {
      return NextResponse.json({ error: 'Application has already been reviewed' }, { status: 400 })
    }

    if (action === 'reject') {
      // Update application status to rejected
      await sql`
        UPDATE pro_applications
        SET 
          status = 'rejected',
          admin_notes = ${admin_notes || null},
          reviewed_by = ${userId},
          reviewed_at = NOW(),
          updated_at = NOW()
        WHERE id = ${id}
      `

      return NextResponse.json({ success: true, message: 'Application rejected.' })
    }

    // --- APPROVE FLOW ---
    // 1. Check if a profile with this email already exists
    const existingProfiles = await sql`SELECT id FROM profiles WHERE email = ${app.email}`

    let profileId: string

    if (existingProfiles && existingProfiles.length > 0) {
      // Profile exists — update role to 'pro' and set the new password
      profileId = existingProfiles[0].id
      const passwordHash = await hashPassword(password)
      await sql`
        UPDATE profiles
        SET 
          role = 'pro',
          password_hash = ${passwordHash},
          display_name = ${app.display_name},
          updated_at = NOW()
        WHERE id = ${profileId}
      `
    } else {
      // Create a new profile with role 'pro'
      // profiles.id has NO default, so we must generate UUID explicitly
      const passwordHash = await hashPassword(password)
      const newProfile = await sql`
        INSERT INTO profiles (id, email, display_name, role, password_hash, created_at, updated_at)
        VALUES (gen_random_uuid(), ${app.email}, ${app.display_name}, 'pro', ${passwordHash}, NOW(), NOW())
        RETURNING id
      `
      profileId = newProfile[0].id
    }

    // 2. Create or update pro_profiles entry
    const existingProProfile = await sql`SELECT id FROM pro_profiles WHERE user_id = ${profileId}`

    if (existingProProfile && existingProProfile.length > 0) {
      await sql`
        UPDATE pro_profiles
        SET 
          status = 'active',
          bio = ${app.achievements || null},
          updated_at = NOW()
        WHERE user_id = ${profileId}
      `
    } else {
      await sql`
        INSERT INTO pro_profiles (user_id, status, bio, created_at, updated_at)
        VALUES (${profileId}, 'active', ${app.achievements || null}, NOW(), NOW())
      `
    }

    // 3. Link the application to the new profile and mark as approved
    await sql`
      UPDATE pro_applications
      SET 
        status = 'approved',
        user_id = ${profileId},
        admin_notes = ${admin_notes || null},
        reviewed_by = ${userId},
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: `Application approved. ${app.display_name} can now log in with the provided password.`,
      profileId
    })

  } catch (error) {
    console.error('Review application error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process application' },
      { status: 500 }
    )
  }
}
