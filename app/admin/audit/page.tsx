'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminAuditPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">View system activity and admin actions</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            Audit log coming soon
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
