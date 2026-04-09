import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('[v0] PRO application submitted:', { email: data.email, games: data.games?.length })
    
    const { fullName, email, password, discordUsername, gamerTag, games, country, customCountry, yearsOfExperience, bio } = data

    // Use customCountry if country is "Other"
    const finalCountry = country === 'Other' ? customCountry : country

    // Validate required fields
    if (!fullName || !email || !password || !discordUsername || !gamerTag || !finalCountry || !yearsOfExperience || !bio || games.length === 0) {
      console.log('[v0] Missing fields:', { fullName: !!fullName, email: !!email, password: !!password, discordUsername: !!discordUsername, gamerTag: !!gamerTag, finalCountry: !!finalCountry, yearsOfExperience: !!yearsOfExperience, bio: !!bio, gamesLength: games?.length })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if email already has an application
    const existingApp = await sql`
      SELECT id FROM pro_applications WHERE email = ${email}
    `

    if (existingApp && existingApp.length > 0) {
      return NextResponse.json({ error: 'Application already exists for this email' }, { status: 400 })
    }

    // Check if email exists in profiles
    const existingUser = await sql`
      SELECT id FROM profiles WHERE email = ${email}
    `

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert application
    const application = await sql`
      INSERT INTO pro_applications (
        full_name, email, password_hash, discord_username, gamer_tag,
        games, country, years_of_experience, bio, status, created_at
      ) VALUES (
        ${fullName}, ${email}, ${passwordHash}, ${discordUsername}, ${gamerTag},
        ${JSON.stringify(games)}, ${finalCountry}, ${yearsOfExperience}, ${bio},
        'pending', NOW()
      )
      RETURNING id, full_name, email, status, created_at
    `

    console.log('[v0] Application created successfully:', application[0].id)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      application: application[0]
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Pro application error:', error)
    return NextResponse.json({ error: 'Failed to submit application. Please try again.' }, { status: 500 })
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
