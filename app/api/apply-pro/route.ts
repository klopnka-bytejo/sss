import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  console.log('[v0] POST /api/apply-pro called')
  
  try {
    const data = await request.json()
    console.log('[v0] Received data keys:', Object.keys(data))
    
    const { fullName, email, password, discordUsername, gamerTag, games, country, customCountry, yearsOfExperience, bio } = data

    // Basic validation
    if (!fullName || !email || !password || !games || games.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const finalCountry = country === 'Other' ? customCountry : country

    // Simple password encoding
    const passwordHash = Buffer.from(password).toString('base64')

    // Insert into database
    const result = await sql`
      INSERT INTO pro_applications (
        full_name, email, password_hash, discord_username, gamer_tag,
        games, country, years_of_experience, bio, status, created_at
      ) VALUES (
        ${fullName}, ${email}, ${passwordHash}, ${discordUsername || ''}, ${gamerTag || ''},
        ${JSON.stringify(games)}, ${finalCountry || 'Unknown'}, ${yearsOfExperience || ''}, ${bio || ''},
        'pending', NOW()
      )
      RETURNING id, full_name, email, status
    `

    console.log('[v0] Application created:', result[0])

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      application: result[0]
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
