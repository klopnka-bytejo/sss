import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { sql } from "@/lib/neon/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminUsersContent } from "@/components/admin/admin-users-content"
import type { Profile } from "@/lib/types"

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  if (!userId) {
    redirect("/auth/admin")
  }

  // Fetch admin profile
  let adminProfile
  if (userId === 'admin-hardcoded-user') {
    // Hardcoded admin - create a temporary admin profile
    adminProfile = {
      id: 'admin-hardcoded-user',
      email: 'sanad.nassar@hotmail.com',
      display_name: 'Admin',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date(),
    }
  } else {
    const adminUsers = await sql`
      SELECT * FROM profiles WHERE id = ${userId}
    `

    if (!adminUsers || adminUsers.length === 0 || adminUsers[0].role !== "admin") {
      redirect("/dashboard")
    }

    adminProfile = adminUsers[0]
  }

  // Fetch all users
  const users = await sql`
    SELECT * FROM profiles ORDER BY created_at DESC
  `

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all users and PROs on the platform</p>
        </div>
        <AdminUsersContent users={users || []} currentUser={adminProfile} />
      </div>
    </AdminLayout>
  )
}
