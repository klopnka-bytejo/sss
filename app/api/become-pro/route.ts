import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'

// Schema validation helper - matches ACTUAL database columns
function validateProApplication(data: any) {
  const errors: Record<string, string> = {}
  
  // display_name is required in database (NOT NULL)
  if (!data.fullName?.trim() && !data.displayName?.trim()) {
    errors.fullName = 'Display name is required'
  }
  // email is required in database (NOT NULL)
  if (!data.email?.trim()) errors.email = 'Email is required'
  // games - optional, defaults to empty array in database
  if (!data.games || data.games.length === 0) errors.games = 'Select at least one game'
  
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

    // Extract fields from request - map frontend names to database columns
    const { 
      fullName, 
      displayName,
      email, 
      discordUsername, 
      discord,
      games, 
      yearsOfExperience, 
      experience,
      bio,
      achievements
    } = body

    // Map frontend field names to ACTUAL database column names:
    // Frontend: fullName -> Database: display_name
    // Frontend: discordUsername -> Database: discord
    // Frontend: yearsOfExperience -> Database: experience
    // Frontend: bio -> Database: achievements
    const displayNameValue = (fullName || displayName || '').trim()
    const discordValue = (discordUsername || discord || '').trim() || null
    const experienceValue = (yearsOfExperience || experience || '').trim() || null
    const achievementsValue = (bio || achievements || '').trim() || null
    const gamesJson = JSON.stringify(games || [])

    // Insert application using ACTUAL database column names:
    // id, user_id, email, display_name, discord, games, experience, achievements, status, admin_notes, reviewed_by, reviewed_at, created_at, updated_at
    const result = await sql`
      INSERT INTO pro_applications (
        user_id,
        email,
        display_name,
        discord,
        games,
        experience,
        achievements,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${userId || null},
        ${email.trim()},
        ${displayNameValue},
        ${discordValue},
        ${gamesJson}::jsonb,
        ${experienceValue},
        ${achievementsValue},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING id, display_name, email, status, created_at
    `

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
        message: `Failed to submit application: ${message}`
      },
      { status: 500 }
    )
  }
}
