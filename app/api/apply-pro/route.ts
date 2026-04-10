import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  console.log('[v0] POST /api/apply-pro called')
  
  try {
    const data = await request.json()
    console.log('[v0] Received data')
    
    const { fullName, email, password, discordUsername, gamerTag, games, country, customCountry, yearsOfExperience, bio } = data

    console.log('[v0] Extracted fields:', { fullName, email, hasPassword: !!password, gamesCount: games?.length })

    // Basic validation
    if (!fullName || !email || !password) {
      console.log('[v0] Missing basic fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const finalCountry = country === 'Other' ? customCountry : country
    console.log('[v0] Final country:', finalCountry)

    // Simple password encoding
    const passwordHash = Buffer.from(password).toString('base64')
    console.log('[v0] Password encoded')

    // Create games JSON string
    const gamesJson = JSON.stringify(games || [])
    console.log('[v0] Games JSON:', gamesJson)

    console.log('[v0] Preparing INSERT statement...')
    // Insert into database
    const result = await sql`
      INSERT INTO pro_applications (
        full_name, 
        email, 
        password_hash, 
        discord_username, 
        gamer_tag,
        games, 
        country, 
        years_of_experience, 
        bio, 
        status, 
        created_at
      ) VALUES (
        ${fullName}, 
        ${email}, 
        ${passwordHash}, 
        ${discordUsername || ''}, 
        ${gamerTag || ''},
        ${gamesJson}, 
        ${finalCountry || 'Unknown'}, 
        ${yearsOfExperience || ''}, 
        ${bio || ''},
        'pending', 
        NOW()
      )
      RETURNING id, full_name, email, status
    `

    console.log('[v0] INSERT successful, result:', result[0]?.id)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      application: result[0]
    })
  } catch (error) {
    console.error('[v0] Error in POST handler:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Error message:', msg)
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}
