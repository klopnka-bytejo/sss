import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/pro-applications called')
    const data = await request.json()
    console.log('[v0] Request body received:', Object.keys(data))
    
    const { fullName, email, password, discordUsername, gamerTag, games, country, customCountry, yearsOfExperience, bio } = data

    // Validate basics first
    console.log('[v0] Validating fields...')
    if (!fullName?.trim()) {
      console.log('[v0] Missing fullName')
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }
    if (!email?.trim()) {
      console.log('[v0] Missing email')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!password?.trim()) {
      console.log('[v0] Missing password')
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }
    if (password.length < 8) {
      console.log('[v0] Password too short')
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    if (!games || games.length === 0) {
      console.log('[v0] No games selected')
      return NextResponse.json({ error: 'Please select at least one game' }, { status: 400 })
    }

    // Use customCountry if country is "Other"
    const finalCountry = country === 'Other' ? customCountry : country
    if (!finalCountry?.trim()) {
      console.log('[v0] Missing country')
      return NextResponse.json({ error: 'Country is required' }, { status: 400 })
    }

    console.log('[v0] All validations passed, checking database...')
    
    // Check if email already has an application
    try {
      const existingApp = await sql`
        SELECT id FROM pro_applications WHERE email = ${email}
      `

      if (existingApp && existingApp.length > 0) {
        console.log('[v0] Email already has application')
        return NextResponse.json({ error: 'Application already exists for this email' }, { status: 400 })
      }
    } catch (dbError) {
      console.error('[v0] Error checking existing app:', dbError)
      // Continue anyway - table might not exist yet
    }

    // Check if email exists in profiles
    try {
      const existingUser = await sql`
        SELECT id FROM profiles WHERE email = ${email}
      `

      if (existingUser && existingUser.length > 0) {
        console.log('[v0] Email already exists in profiles')
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
      }
    } catch (dbError) {
      console.error('[v0] Error checking profiles:', dbError)
      // Continue anyway
    }

    console.log('[v0] Hashing password...')
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('[v0] Password hashed')

    console.log('[v0] Inserting into database...')
    // Insert application
    const application = await sql`
      INSERT INTO pro_applications (
        full_name, email, password_hash, discord_username, gamer_tag,
        games, country, years_of_experience, bio, status, created_at
      ) VALUES (
        ${fullName}, ${email}, ${passwordHash}, ${discordUsername || ''}, ${gamerTag || ''},
        ${JSON.stringify(games)}, ${finalCountry}, ${yearsOfExperience || ''}, ${bio || ''},
        'pending', NOW()
      )
      RETURNING id, full_name, email, status, created_at
    `

    console.log('[v0] Application created successfully:', application[0]?.id)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      application: application[0]
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Pro application error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to submit application: ${errorMessage}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Get all applications
    const applications = await sql`
      SELECT 
        id, full_name, email, discord_username, gamer_tag,
        games, country, years_of_experience, bio, status,
        created_at, reviewed_at, reviewed_by
      FROM pro_applications
      ORDER BY created_at DESC
    `

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('[v0] Get applications error:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
