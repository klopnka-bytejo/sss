import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch user's cart items
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      service:services(
        id, title, description, game, price_cents, price_type,
        game_info:games(name, logo_url)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => sum + item.calculated_price_cents, 0) || 0

  return NextResponse.json({ 
    items: cartItems || [],
    subtotal,
    itemCount: cartItems?.length || 0
  })
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { service_id, selected_options, calculated_price_cents, requirements } = body

  if (!service_id || !calculated_price_cents) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if item already exists with same options
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('service_id', service_id)
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
