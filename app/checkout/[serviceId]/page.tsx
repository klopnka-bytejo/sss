import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayout } from '@/components/app-layout'
import { CheckoutContent } from '@/components/checkout/checkout-content'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = await params
  const supabase = await createClient()
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/checkout/' + serviceId)
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get service details
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (error || !service) {
    redirect('/services')
  }

  // Get service add-ons
  const { data: addons } = await supabase
    .from('service_addons')
    .select('*')
    .eq('service_id', serviceId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Get active discounts
  const { data: discounts } = await supabase
    .from('discounts')
    .select('*')
    .eq('is_active', true)

  return (
    <AppLayout>
      <CheckoutContent 
        service={service}
        addons={addons || []}
        discounts={discounts || []}
        user={profile}
      />
    </AppLayout>
  )
}
