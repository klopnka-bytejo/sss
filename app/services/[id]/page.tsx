import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon/server'
import { AppLayout } from '@/components/app-layout'
import { ServiceDetailContent } from '@/components/services/service-detail-content'

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let service: any = null
  let reviews: any[] = []

  try {
    // Get service details
    const services = await sql`
      SELECT s.*, g.name as game_name, g.slug as game_slug
      FROM services s
      LEFT JOIN games g ON s.game_id = g.id
      WHERE s.id = ${id}
      LIMIT 1
    `

    if (!services || services.length === 0) {
      redirect('/services')
    }

    service = services[0]

    // Get reviews for this PRO (skip if no pro_id)
    if (service.pro_id) {
      reviews = await sql`
        SELECT r.*, p.display_name, p.avatar_url
        FROM reviews r
        LEFT JOIN profiles p ON r.reviewer_id = p.id
        WHERE r.pro_id = ${service.pro_id}
        ORDER BY r.created_at DESC
        LIMIT 5
      `
    }
  } catch (error) {
    console.error('[v0] Database error:', error)
    redirect('/services')
  }

  return (
    <AppLayout>
      <ServiceDetailContent 
        service={service}
        addons={[]}
        reviews={reviews || []} 
        isLoggedIn={false}
      />
    </AppLayout>
  )
}
