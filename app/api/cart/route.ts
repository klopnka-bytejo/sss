import { sql } from '@/lib/neon/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch user's cart items
export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers (would need proper auth implementation)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await sql`
      SELECT ci.*, s.title, s.description, g.name as game_name
      FROM cart_items ci
      LEFT JOIN services s ON ci.service_id = s.id
      LEFT JOIN games g ON s.game_id = g.id
      WHERE ci.user_id = ${userId}
      ORDER BY ci.created_at DESC
    `

    const subtotal = cartItems?.reduce((sum: number, item: any) => sum + item.calculated_price_cents, 0) || 0

    return NextResponse.json({ 
      items: cartItems || [],
      subtotal,
      itemCount: cartItems?.length || 0
    })
  } catch (error) {
    console.error('Cart error:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { service_id, selected_options, calculated_price_cents, requirements } = body

    if (!service_id || !calculated_price_cents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if item already exists with same options
    const existing = await sql`
      SELECT id FROM cart_items
      WHERE user_id = ${userId}
      AND service_id = ${service_id}
      LIMIT 1
    `

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Item already in cart' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO cart_items (user_id, service_id, selected_options, calculated_price_cents, requirements)
      VALUES (${userId}, ${service_id}, ${JSON.stringify(selected_options || {})}, ${calculated_price_cents}, ${JSON.stringify(requirements || {})})
      RETURNING id
    `

    return NextResponse.json({ cartItem: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    await sql`
      DELETE FROM cart_items
      WHERE id = ${itemId} AND user_id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete cart error:', error)
    return NextResponse.json({ error: 'Failed to delete from cart' }, { status: 500 })
  }
}
    .eq('selected_options', selected_options || {})
    .single()

  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity: 1, // For services, quantity is always 1
        calculated_price_cents,
        requirements,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ item: data, updated: true })
  }

  // Create new cart item
  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: user.id,
      service_id,
      selected_options: selected_options || {},
      calculated_price_cents,
      requirements: requirements || {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data, created: true })
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get('id')

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
