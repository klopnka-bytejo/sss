import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/submit-pro-application called - redirecting to /api/become-pro')
    
    // This endpoint is deprecated - redirect to /api/become-pro
    const body = await request.json()
    
    // Convert field names if needed
    const newBody = {
      fullName: body.fullName || body.full_name,
      email: body.email,
      password: body.password,
      discordUsername: body.discordUsername || body.discord_username,
      gamerTag: body.gamerTag || body.gamer_tag,
      games: body.games || [],
      country: body.country,
      customCountry: body.customCountry,
      yearsOfExperience: body.yearsOfExperience || body.years_of_experience,
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
    console.error('[v0] Error in /api/submit-pro-application:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application' },
      { status: 500 }
    )
  }
}
