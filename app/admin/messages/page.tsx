import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminMessagesContent } from '@/components/admin/admin-all-messages-content'

export default async function AdminMessagesPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    redirect('/auth/admin')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages Monitoring</h1>
          <p className="text-muted-foreground">Monitor all messages between users and PROs, manage disputes</p>
        </div>
        <AdminMessagesContent />
      </div>
    </AdminLayout>
  )
}
