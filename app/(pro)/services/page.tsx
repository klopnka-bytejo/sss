import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { PROServicesContent } from '@/components/pro/pro-services-content'

export default async function PROServicesPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  const userRole = cookieStore.get('user_role')?.value

  if (!userId) {
    redirect('/auth/login')
  }

  if (userRole !== 'pro') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <PROServicesContent />
      </div>
    </div>
  )
}
