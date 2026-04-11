import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const options = await sql`
      SELECT 
        id,
        service_id,
        option_type,
        label,
        value,
        price_modifier,
        sort_order
      FROM service_options
      WHERE service_id = ${id}
      ORDER BY option_type, sort_order ASC
    `

    // Group options by type
    const groupedOptions: Record<string, any[]> = {}
    for (const option of options || []) {
      if (!groupedOptions[option.option_type]) {
        groupedOptions[option.option_type] = []
      }
      groupedOptions[option.option_type].push(option)
    }

    return NextResponse.json({ 
      options: groupedOptions, 
      raw: options || [],
      success: true 
    })
  } catch (error) {
    console.error('[v0] Get service options error:', error)
    return NextResponse.json({ error: 'Failed to fetch options', options: {} }, { status: 500 })
  }
}
