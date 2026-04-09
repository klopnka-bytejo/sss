import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { fullName, email, discordUsername, gamerTag, games, country, yearsOfExperience, bio } = data

    // Validate required fields
    if (!fullName || !email || !discordUsername || !gamerTag || !country || !yearsOfExperience || !bio || games.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await sql`
      SELECT id FROM profiles WHERE email = ${email}
    `

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 400 })
    }

    // Create application record (stored as metadata for now)
    const applicationData = {
      fullName,
      email,
      discordUsername,
      gamerTag,
      games,
      country,
      yearsOfExperience,
      bio,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    // In production, store this in a pro_applications table
    console.log('[v0] Pro application submitted:', applicationData)

    return NextResponse.json({
      message: 'Application submitted successfully. We will contact you soon.',
      application: applicationData
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Pro application error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
