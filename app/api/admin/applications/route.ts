import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch all PRO applications (admin only)
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

  let query = supabase
    .from('pro_applications')
    .select(`
      *,
      user:profiles!pro_applications_user_id_fkey(id, full_name, email, avatar_url),
      reviewer:profiles!pro_applications_reviewed_by_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: applications, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ applications: applications || [] })
}

// PATCH - Review application (approve/reject)
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
  const { application_id, action, admin_notes } = body

  if (!application_id || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['approve', 'reject', 'request_info', 'under_review'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Get the application
  const { data: application } = await supabase
    .from('pro_applications')
    .select('*')
    .eq('id', application_id)
    .single()

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  let newStatus: string
  switch (action) {
    case 'approve':
      newStatus = 'approved'
      break
    case 'reject':
      newStatus = 'rejected'
      break
    case 'request_info':
      newStatus = 'more_info_needed'
      break
    case 'under_review':
      newStatus = 'under_review'
      break
    default:
      newStatus = application.status
  }

  // Update application
  const { data: updatedApplication, error } = await supabase
    .from('pro_applications')
    .update({
      status: newStatus,
      admin_notes: admin_notes || application.admin_notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', application_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If approved, upgrade user to PRO
  if (action === 'approve') {
    // Update user role to PRO
    await supabase
      .from('profiles')
      .update({ 
        role: 'pro',
        full_name: application.display_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', application.user_id)

    // Create PRO profile
    await supabase.from('pro_profiles').upsert({
      user_id: application.user_id,
      display_name: application.display_name,
      games: application.games,
      is_verified: true,
      is_active: true,
      rating: 5.0,
      total_reviews: 0,
      total_orders: 0,
      completion_rate: 100,
    })

    // Create wallet if doesn't exist
    await supabase.from('wallets').upsert({
      user_id: application.user_id,
      balance_cents: 0,
      pending_cents: 0,
    })
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: `pro_application_${action}`,
    entity_type: 'pro_application',
    entity_id: application_id,
    details: { 
      applicant_id: application.user_id,
      previous_status: application.status,
      new_status: newStatus 
    },
  })

  return NextResponse.json({ 
    application: updatedApplication,
    message: action === 'approve' 
      ? 'Application approved. User has been upgraded to PRO.'
      : action === 'reject'
      ? 'Application rejected.'
      : 'Application updated.'
  })
}
