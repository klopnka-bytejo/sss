import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch all fines (admin only)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const proId = searchParams.get('pro_id')

  let query = supabase
    .from('pro_fines')
    .select(`
      *,
      pro:profiles!pro_fines_pro_id_fkey(id, full_name, email),
      order:orders(id, order_number),
      created_by_user:profiles!pro_fines_created_by_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }
  if (proId) {
    query = query.eq('pro_id', proId)
  }

  const { data: fines, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ fines: fines || [] })
}

// POST - Create a new fine (admin only)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { pro_id, order_id, amount_cents, reason, fine_type, admin_notes } = body

  if (!pro_id || !amount_cents || !reason || !fine_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: fine, error } = await supabase
    .from('pro_fines')
    .insert({
      pro_id,
      order_id,
      amount_cents,
      reason,
      fine_type,
      admin_notes,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'fine_created',
    entity_type: 'pro_fine',
    entity_id: fine.id,
    details: { pro_id, amount_cents, fine_type, reason },
  })

  return NextResponse.json({ fine })
}

// PATCH - Update fine status (deduct or waive)
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { fine_id, action, admin_notes } = body

  if (!fine_id || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['deduct', 'waive'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Get the fine
  const { data: fine } = await supabase
    .from('pro_fines')
    .select('*')
    .eq('id', fine_id)
    .single()

  if (!fine) {
    return NextResponse.json({ error: 'Fine not found' }, { status: 404 })
  }

  if (fine.status !== 'pending') {
    return NextResponse.json({ error: 'Fine already processed' }, { status: 400 })
  }

  const newStatus = action === 'deduct' ? 'deducted' : 'waived'

  // If deducting, subtract from PRO's balance
  if (action === 'deduct') {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance_cents')
      .eq('user_id', fine.pro_id)
      .single()

    if (wallet) {
      await supabase
        .from('wallets')
        .update({ 
          balance_cents: Math.max(0, wallet.balance_cents - fine.amount_cents),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', fine.pro_id)

      // Create transaction record
      await supabase.from('wallet_transactions').insert({
        wallet_id: fine.pro_id,
        type: 'fine',
        amount_cents: -fine.amount_cents,
        description: `Fine deducted: ${fine.reason}`,
        reference_id: fine.id,
      })
    }
  }

  // Update fine status
  const { data: updatedFine, error } = await supabase
    .from('pro_fines')
    .update({
      status: newStatus,
      admin_notes: admin_notes || fine.admin_notes,
      deducted_at: action === 'deduct' ? new Date().toISOString() : null,
    })
    .eq('id', fine_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: `fine_${action}ed`,
    entity_type: 'pro_fine',
    entity_id: fine_id,
    details: { pro_id: fine.pro_id, amount_cents: fine.amount_cents, action },
  })

  return NextResponse.json({ fine: updatedFine })
}
