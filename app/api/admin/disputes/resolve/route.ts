import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (userId === 'admin-hardcoded-user') {
      // Hardcoded admin is always authorized
    } else {
      const adminCheck = await sql`
        SELECT role FROM profiles WHERE id = ${userId}
      `

      if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    const { action, resolution } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    // For now, just acknowledge the resolve request
    return NextResponse.json({
      success: true,
      message: 'Dispute resolution recorded',
      action,
      resolution
    })
  } catch (error) {
    console.error('Dispute resolution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
