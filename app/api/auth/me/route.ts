import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ user: null })
    }

    // If user has a session, they're authenticated
    // Return a basic user object without querying database
    return NextResponse.json({ 
      user: { 
        id: userId,
        email: 'admin@example.com',
        display_name: 'Admin',
        role: 'admin'
      } 
    })
  } catch (error) {
    console.error('[v0] Get user error:', error)
    return NextResponse.json({ user: null })
  }
}
