import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] TEST ENDPOINT: POST received')
    const data = await request.json()
    console.log('[v0] TEST ENDPOINT: Data:', Object.keys(data))
    
    return NextResponse.json({
      success: true,
      message: 'Test successful'
    })
  } catch (error) {
    console.error('[v0] TEST ENDPOINT: Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
