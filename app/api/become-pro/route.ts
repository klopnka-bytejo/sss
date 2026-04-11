import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'

// Schema validation helper
function validateProApplication(data: any) {
  const errors: Record<string, string> = {}
  
  if (!data.fullName?.trim()) errors.fullName = 'Full name is required'
  if (!data.email?.trim()) errors.email = 'Email is required'
  if (!data.password || data.password.length < 8) errors.password = 'Password must be at least 8 characters'
  if (!data.games || data.games.length === 0) errors.games = 'Select at least one game'
  if (!data.country) errors.country = 'Country/Region is required'
  if (data.country === 'Other' && !data.customCountry?.trim()) errors.customCountry = 'Please specify your country'
  
  return Object.keys(errors).length === 0 ? null : errors
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    // Validate request body
    const validationErrors = validateProApplication(body)
    if (validationErrors) {
      return NextResponse.json(
        { success: false, errors: validationErrors, message: 'Validation failed' },
        { status: 400 }
      )
    }

    const { fullName, email, password, discordUsername, gamerTag, games, country, customCountry, yearsOfExperience, bio, message } = body

    const finalCountry = country === 'Other' ? customCountry : country
    const passwordHash = Buffer.from(password).toString('base64')
    const gamesJson = JSON.stringify(games)
    
    // Pre-process optional fields (use empty strings since columns are NOT NULL)
    const discordUsernameValue = discordUsername?.trim() || ''
    const gamerTagValue = gamerTag?.trim() || ''
    const yearsOfExperienceValue = yearsOfExperience?.trim() || ''
    const bioValue = bio?.trim() || ''
    const messageValue = message?.trim() || ''

    // Insert application with all required columns
    const queryText = `
      INSERT INTO pro_applications (
        user_id,
        full_name, 
        email, 
        password_hash, 
        discord_username, 
        gamer_tag,
        games, 
        country, 
        years_of_experience, 
        bio,
        message, 
        status, 
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      )
      RETURNING id, full_name, email, status, created_at
    `

    const values = [
      userId || null,
      fullName.trim(),
      email.trim(),
      passwordHash,
      discordUsernameValue,
      gamerTagValue,
      gamesJson,
      finalCountry.trim(),
      yearsOfExperienceValue,
      bioValue,
      messageValue,
      'pending'
    ]

    const result = await sql.query(queryText, values)

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to create application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will review it and contact you soon.',
      applicationId: result[0].id
    }, { status: 201 })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    
    return NextResponse.json(
      { 
        success: false, 
        message: message.includes('column') ? `Database error: ${message}` : 'Failed to submit application'
      },
      { status: 500 }
    )
  }
}
