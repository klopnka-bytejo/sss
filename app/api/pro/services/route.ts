import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch services for the logged-in PRO
    const services = await sql`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.category,
        s.game,
        s.price_cents,
        s.delivery_time,
        s.is_active,
        s.created_at,
        s.updated_at
      FROM services s
      WHERE s.pro_id = ${userId}
      ORDER BY s.created_at DESC
      LIMIT 100
    `

    console.log('[v0] PRO Services API - found services:', services?.length || 0)
    return NextResponse.json({ services: services || [] })
  } catch (error) {
    console.error('[v0] PRO Services API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, category, game, price_cents, delivery_time } = await request.json()

    if (!title || !category || !price_cents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new service
    const service = await sql`
      INSERT INTO services (
        pro_id,
        title,
        description,
        category,
        game,
        price_cents,
        delivery_time,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${title},
        ${description || null},
        ${category},
        ${game || null},
        ${price_cents},
        ${delivery_time || '7 days'},
        true,
        NOW(),
        NOW()
      )
      RETURNING *
    `

    console.log('[v0] PRO Services API - created service:', service[0].id)
    return NextResponse.json({ service: service[0], success: true })
  } catch (error) {
    console.error('[v0] PRO Services API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceId, title, description, category, game, price_cents, delivery_time, is_active } = await request.json()

    if (!serviceId) {
      return NextResponse.json({ error: 'Missing serviceId' }, { status: 400 })
    }

    // Update service (only if it belongs to the user)
    const service = await sql`
      UPDATE services 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        category = COALESCE(${category}, category),
        game = COALESCE(${game}, game),
        price_cents = COALESCE(${price_cents}, price_cents),
        delivery_time = COALESCE(${delivery_time}, delivery_time),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${serviceId} AND pro_id = ${userId}
      RETURNING *
    `

    if (!service || service.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    console.log('[v0] PRO Services API - updated service:', serviceId)
    return NextResponse.json({ service: service[0], success: true })
  } catch (error) {
    console.error('[v0] PRO Services API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceId } = await request.json()

    if (!serviceId) {
      return NextResponse.json({ error: 'Missing serviceId' }, { status: 400 })
    }

    // Delete service (only if it belongs to the user)
    await sql`
      DELETE FROM services 
      WHERE id = ${serviceId} AND pro_id = ${userId}
    `

    console.log('[v0] PRO Services API - deleted service:', serviceId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] PRO Services API error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
