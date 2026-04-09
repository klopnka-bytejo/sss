'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminPricingPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">Manage platform pricing and fees</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            Pricing management coming soon
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
