import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminConversationsContent } from '@/components/admin/admin-conversations-content'

export default async function AdminConversationsPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    redirect('/auth/admin')
  }

  // User is authenticated via session - pass userId to client component
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Conversations</h1>
          <p className="text-muted-foreground">View and manage all user conversations</p>
        </div>
        <AdminConversationsContent userId={userId} />
      </div>
    </AdminLayout>
  )
}
