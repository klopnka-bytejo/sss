import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { MessagingContent } from '@/components/messaging/messaging-content'

export default async function MessagingPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <MessagingContent />
    </div>
  )
}
