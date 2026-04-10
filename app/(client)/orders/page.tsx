import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ClientOrdersContent } from '@/components/client/client-orders-content'

export default async function ClientOrdersPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <ClientOrdersContent />
      </div>
    </div>
  )
}
