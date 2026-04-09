'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminGamesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Games Management</h1>
          <p className="text-muted-foreground">Manage games and categories</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            Games management coming soon
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
