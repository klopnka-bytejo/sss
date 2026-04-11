import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

// POST - Submit PRO application
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/pro/apply called - redirecting to /api/become-pro')
    
    // Redirect all requests to the new endpoint
    const body = await request.json()
    
    // Convert old field names to new format if needed
    const newBody = {
      fullName: body.full_name || body.fullName,
      email: body.email,
      password: body.password,
      discordUsername: body.discord_username || body.discordUsername,
      gamerTag: body.gamer_tag || body.gamerTag,
      games: body.games || [],
      country: body.country,
      customCountry: body.customCountry,
      yearsOfExperience: body.experience_years || body.yearsOfExperience,
      bio: body.bio
    }

    // Call the new endpoint
    const response = await fetch(new URL('/api/become-pro', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBody)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v0] Error in /api/pro/apply:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application' },
      { status: 500 }
    )
  }
}

// GET - Get user's application status (using cookie-based auth)
export async function GET() {
  try {
    console.log('[v0] GET /api/pro/apply called')
    
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      console.log('[v0] GET /api/pro/apply: No userId - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] GET /api/pro/apply: Fetching application for user:', userId)

    // Fetch user's latest application from pro_applications table
    // Note: pro_applications doesn't have user_id column, so we search by email
    const user = await sql`
      SELECT email FROM profiles WHERE id = ${userId}
    `

    if (!user || user.length === 0) {
      console.log('[v0] GET /api/pro/apply: User not found')
      return NextResponse.json({ application: null })
    }

    const userEmail = user[0].email

    const applications = await sql`
      SELECT 
        id,
        full_name,
        email,
        discord_username,
        gamer_tag,
        games,
        country,
        years_of_experience,
        bio,
        status,
        rejection_reason,
        created_at,
        updated_at,
        reviewed_at
      FROM pro_applications
      WHERE email = ${userEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `

    console.log('[v0] GET /api/pro/apply: Found application:', applications?.[0]?.id || null)

    return NextResponse.json({ application: applications?.[0] || null })
  } catch (error) {
    console.error('[v0] GET /api/pro/apply error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch application' },
      { status: 500 }
    )
  }
}
