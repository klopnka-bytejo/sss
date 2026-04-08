import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode } = await request.json()

    if (!email || !verificationCode) {
      return NextResponse.json({ error: 'Email and verification code required' }, { status: 400 })
    }

    // Get user
    const users = await sql`
      SELECT id, email, metadata FROM profiles WHERE email = ${email}
    `

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]
    const metadata = user.metadata || {}

    // Check verification code
    if (metadata.verificationCode !== verificationCode.toUpperCase()) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Mark as verified
    await sql`
      UPDATE profiles 
      SET metadata = ${{ ...metadata, verified: true }}::jsonb, updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ 
      message: 'Email verified successfully',
      verified: true
    })
  } catch (error) {
    console.error('[v0] Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
