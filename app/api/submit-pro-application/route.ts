import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, password, games, country, customCountry, yearsOfExperience, bio, discordUsername, gamerTag } = body

    // Validation
    if (!fullName || !email || !password || !games?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use custom country if "Other" is selected
    const finalCountry = country === 'Other' ? customCountry : country
    if (!finalCountry) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 })
    }

    // Simple password hash
    const passwordHash = Buffer.from(password).toString('base64')

    // Insert application
    const result = await sql`
      INSERT INTO pro_applications (
        full_name, email, password_hash, discord_username, gamer_tag, games, country, 
        years_of_experience, bio, status, created_at
      ) VALUES (
        ${fullName}, ${email}, ${passwordHash}, ${discordUsername || ''}, ${gamerTag || ''}, 
        ${JSON.stringify(games)}, ${finalCountry}, ${yearsOfExperience || ''}, ${bio || ''}, 
        'pending', NOW()
      )
      RETURNING id, full_name, email
    `

    return NextResponse.json({
      success: true,
      message: 'Application submitted! We will contact you on Discord soon.',
      data: result[0]
    })
  } catch (error) {
    console.error('[v0] Application submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
