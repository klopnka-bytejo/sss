import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayout } from '@/components/app-layout'
import { ServiceDetailContent } from '@/components/services/service-detail-content'

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get service details
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !service) {
    redirect('/services')
  }

  // Get service add-ons
  const { data: addons } = await supabase
    .from('service_addons')
    .select('*')
    .eq('service_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Get reviews for this PRO (skip if no pro_id)
  let reviews: any[] = []
  if (service.pro_id) {
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, client:profiles(*)')
      .eq('pro_id', service.pro_id)
      .order('created_at', { ascending: false })
      .limit(5)
    reviews = reviewsData || []
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <AppLayout>
      <ServiceDetailContent 
        service={service}
        addons={addons || []}
        reviews={reviews} 
        isLoggedIn={!!user}
      />
    </AppLayout>
  )
}
