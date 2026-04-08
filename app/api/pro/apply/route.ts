import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Submit PRO application
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user already has a pending application
  const { data: existing } = await supabase
    .from('pro_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'under_review'])
    .single()

  if (existing) {
    return NextResponse.json({ 
      error: 'You already have a pending application',
      application_id: existing.id 
    }, { status: 400 })
  }

  // Check if user is already a PRO
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'pro') {
    return NextResponse.json({ error: 'You are already a PRO' }, { status: 400 })
  }

  const body = await request.json()
  const {
    full_name,
    display_name,
    email,
    phone,
    country,
    timezone,
    date_of_birth,
    games,
    experience_years,
    experience_hours,
    achievements,
    proof_links,
    gaming_profiles,
    weekly_availability,
    delivery_methods,
    languages,
    accepted_terms,
    accepted_pro_policy,
  } = body

  // Validate required fields
  if (!full_name || !display_name || !email || !country || !timezone || !games?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!accepted_terms || !accepted_pro_policy) {
    return NextResponse.json({ error: 'You must accept the terms and PRO policy' }, { status: 400 })
  }

  const { data: application, error } = await supabase
    .from('pro_applications')
    .insert({
      user_id: user.id,
      full_name,
      display_name,
      email,
      phone,
      country,
      timezone,
      date_of_birth,
      games,
      experience_years,
      experience_hours,
      achievements,
      proof_links: proof_links || [],
      gaming_profiles: gaming_profiles || [],
      weekly_availability: weekly_availability || {},
      delivery_methods: delivery_methods || [],
      languages: languages || [],
      accepted_terms,
      accepted_pro_policy,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'pro_application_submitted',
    entity_type: 'pro_application',
    entity_id: application.id,
    details: { games, country },
  })

  return NextResponse.json({ 
    application,
    message: 'Application submitted successfully. We will review it within 24-48 hours.'
  })
}

// GET - Get user's application status
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: application, error } = await supabase
    .from('pro_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ application: application || null })
}
