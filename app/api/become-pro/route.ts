import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/become-pro called')
    
    const body = await request.json()
    console.log('[v0] Request received')

    const { fullName, email, password, discordUsername, gamerTag, games, country, customCountry, yearsOfExperience, bio } = body

    // Validate required fields
    if (!fullName?.trim()) throw new Error('Full name is required')
    if (!email?.trim()) throw new Error('Email is required')
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters')
    if (!games || games.length === 0) throw new Error('Select at least one game')
    if (!country) throw new Error('Country is required')
    if (country === 'Other' && !customCountry?.trim()) throw new Error('Please specify your country')

    console.log('[v0] Validation passed')

    const finalCountry = country === 'Other' ? customCountry : country
    const passwordHash = Buffer.from(password).toString('base64')
    const gamesJson = JSON.stringify(games)

    console.log('[v0] Inserting into database...')

    // Insert application
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
        ${finalCountry}, 
        ${yearsOfExperience || ''}, 
        ${bio || ''},
        'pending', 
        NOW()
      )
      RETURNING id, full_name, email, status, created_at
    `

    console.log('[v0] Application created successfully:', result[0]?.id)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will contact you through Discord to continue your application process.',
      application: result[0]
    }, { status: 201 })

  } catch (error) {
    console.error('[v0] Error:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    )
  }
}
