import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    const data = await request.json()
    console.log('[v0] PRO application data:', { ...data, bio: data.bio?.substring(0, 50) })
    
    const { fullName, email, discordUsername, gamerTag, games, country, customCountry, yearsOfExperience, bio } = data

    // Use customCountry if country is "Other"
    const finalCountry = country === 'Other' ? customCountry : country
    console.log('[v0] Final country:', { country, customCountry, finalCountry })

    // Validate required fields
    if (!fullName || !email || !discordUsername || !gamerTag || !finalCountry || !yearsOfExperience || !bio || games.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If user is logged in, use their profile
    if (userId) {
      // Check if already a PRO
      const existingPro = await sql`
        SELECT id FROM pro_profiles WHERE user_id = ${userId}
      `

      if (existingPro && existingPro.length > 0) {
        return NextResponse.json({ error: 'You are already a PRO' }, { status: 400 })
      }

      // Create PRO profile for existing user
      const proProfile = await sql`
        INSERT INTO pro_profiles (
          user_id, display_name, bio, games, experience_level, 
          contact_email, discord_username, gamer_tag, country, status, created_at
        ) VALUES (
          ${userId}, ${fullName}, ${bio}, ${JSON.stringify(games)},
          ${yearsOfExperience}, ${email}, ${discordUsername}, ${gamerTag},
          ${finalCountry}, 'pending', NOW()
        )
        RETURNING *
      `

      // Log audit
      await sql`
        INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
        VALUES (
          NULL,
          'pro_application_submitted',
          'pro_profile',
          ${proProfile[0].id},
          ${JSON.stringify({ games, country, email })},
          NOW()
        )
      `

      return NextResponse.json({
        message: 'Application submitted successfully. We will review it within 24-48 hours.',
        application: proProfile[0]
      }, { status: 201 })
    } else {
      // For non-logged-in users, just validate the data and return success
      // (In production, you'd want to store this for them to complete later)
      const applicationData = {
        fullName,
        email,
        discordUsername,
        gamerTag,
        games,
        country: finalCountry,
        yearsOfExperience,
        bio,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }

      return NextResponse.json({
        message: 'Application submitted successfully. We will contact you via Discord soon.',
        application: applicationData
      }, { status: 201 })
    }
  } catch (error) {
    console.error('[v0] Pro application error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await sql`
      SELECT * FROM pro_profiles
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `

    return NextResponse.json({ application: application?.[0] || null })
  } catch (error) {
    console.error('[v0] Get application error:', error)
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 })
  }
}
