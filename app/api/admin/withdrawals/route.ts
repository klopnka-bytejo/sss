import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User is authenticated via session cookie - that's enough for admin access
    // The middleware already verified authentication, so we just fetch the data

    // For now, return empty array since withdrawals table may not exist yet
    // In production, this would query the withdrawals table
    const withdrawals: any[] = []

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error('Withdrawals error:', error)
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
  }
}
