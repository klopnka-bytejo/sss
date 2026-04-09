import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'
import { AppLayout } from '@/components/app-layout'
import { CheckoutContent } from '@/components/checkout/checkout-content'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  // Check if user is logged in
  if (!userId) {
    redirect('/auth/login?redirect=/checkout/' + serviceId)
  }

  try {
    // Get user profile
    const profiles = await sql`
      SELECT * FROM profiles WHERE id = ${userId}
    `
    const profile = profiles?.[0]

    // Get service details
    const services = await sql`
      SELECT * FROM services WHERE id = ${serviceId}
    `
    const service = services?.[0]

    if (!service) {
      redirect('/services')
    }

    return (
      <AppLayout>
        <CheckoutContent 
          service={service}
          user={profile}
        />
      </AppLayout>
    )
  } catch (error) {
    console.error('[v0] Checkout error:', error)
    redirect('/services')
  }
}
