'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { SendMessageDialog } from "@/components/messaging/send-message-dialog"
import { 
  Search, 
  MoreVertical,
  Shield,
  UserCheck,
  MessageSquare,
  Loader2
} from "lucide-react"
import type { Profile, UserRole } from "@/lib/types"

interface AdminUsersContentProps {
  userId: string
}

const roleColors: Record<UserRole, string> = {
  client: "bg-blue-500/20 text-blue-500",
  pro: "bg-purple-500/20 text-purple-500",
  admin: "bg-red-500/20 text-red-500",
}

export function AdminUsersContent({ userId }: AdminUsersContentProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [updating, setUpdating] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)

  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('[v0] Fetching users from API...')
        const response = await fetch('/api/admin/users')
        console.log('[v0] API Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[v0] API error:', response.status, errorText)
          setError(`Failed to fetch users: ${response.status}`)
          setLoading(false)
          return
        }
        
        const data = await response.json()
        console.log('[v0] Fetched users:', data.users?.length || 0, data.users)
        setUsers(data.users || [])
        setError(null)
      } catch (error) {
        console.error('[v0] Error fetching users:', error)
        setError(`Error fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleOpenMessage = (user: Profile) => {
    setSelectedUser(user)
    setMessageDialogOpen(true)
  }

  const handleUpdateRole = async (targetUserId: string, newRole: UserRole) => {
    if (targetUserId === userId) {
      alert("You cannot change your own role")
      return
    }

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetUserId, 
          action: 'change_role',
          newRole 
        })
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === targetUserId ? { ...u, role: newRole } : u))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('[v0] Error updating role:', error)
      alert('Error updating role')
    } finally {
      setUpdating(false)
    }
  }

  const getInitials = (user: Profile) => {
    if (user.display_name) return user.display_name.slice(0, 2).toUpperCase()
    return user.email.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
        <p className="font-semibold">Error Loading Users</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                {users.length === 0 ? 'No users in the system' : 'No users match your search'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
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
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                              {getInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{user.display_name || 'Unknown'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role] || roleColors.client}>
                          {(user.role || 'client').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={updating}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOpenMessage(user)}
                              disabled={updating}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Change Role
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateRole(user.id, "client")}
                              disabled={user.role === "client" || user.id === userId || updating}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Set as Client
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateRole(user.id, "pro")}
                              disabled={user.role === "pro" || user.id === userId || updating}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Set as PRO
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message Dialog */}
      {selectedUser && (
        <SendMessageDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          recipient={selectedUser}
        />
      )}
    </>
  )
}
