'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminChatMonitoringPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat Monitoring</h1>
          <p className="text-muted-foreground">Monitor and moderate user conversations</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            Chat monitoring coming soon
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
