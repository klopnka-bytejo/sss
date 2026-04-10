import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminUsersContent } from "@/components/admin/admin-users-content"

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  if (!userId) {
    redirect("/auth/admin")
  }

  // User is authenticated via session - pass userId to client component
  // The client will fetch users from API

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all users and PROs on the platform</p>
        </div>
        <AdminUsersContent userId={userId} />
      </div>
    </AdminLayout>
  )
}
