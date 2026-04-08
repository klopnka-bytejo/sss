"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Users,
  MoreVertical,
  Shield,
  Ban,
  UserCheck,
  Mail
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile, UserRole } from "@/lib/types"

interface AdminUsersContentProps {
  users: Profile[]
  currentUser: Profile
}

const roleColors: Record<UserRole, string> = {
  client: "bg-blue-500/20 text-blue-500",
  pro: "bg-purple-500/20 text-purple-500",
  admin: "bg-red-500/20 text-red-500",
}

export function AdminUsersContent({ users: initialUsers, currentUser }: AdminUsersContentProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (userId === currentUser.id) {
      alert("You cannot change your own role")
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
  }

  const getInitials = (user: Profile) => {
    if (user.username) return user.username.slice(0, 2).toUpperCase()
    return user.email.slice(0, 2).toUpperCase()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all platform users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {users.length} Users
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-input"
        />
      </div>

      {/* Users Table */}
      <Card className="glass">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username || "No username"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(user.balance_cents)}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Change Role
                        </DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateRole(user.id, "client")}
                          disabled={user.role === "client" || user.id === currentUser.id}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Set as Client
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateRole(user.id, "pro")}
                          disabled={user.role === "pro" || user.id === currentUser.id}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Set as PRO
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateRole(user.id, "admin")}
                          disabled={user.role === "admin" || user.id === currentUser.id}
                        >
                          <Shield className="mr-2 h-4 w-4 text-destructive" />
                          Set as Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
