"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Package, 
  DollarSign, 
  AlertTriangle,
  ArrowRight,
  Shield,
  TrendingUp,
  Wallet,
  Clock
} from "lucide-react"
import type { Order, Profile } from "@/lib/types"

interface AdminDashboardProps {
  stats: {
    totalUsers: number
    totalOrders: number
    totalPros: number
    pendingDisputes: number
    pendingWithdrawals: number
  }
  recentOrders: Order[]
  recentUsers: Profile[]
}

export function AdminDashboard({ stats, recentOrders, recentUsers }: AdminDashboardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    paid: "bg-blue-500/20 text-blue-500",
    in_progress: "bg-purple-500/20 text-purple-500",
    pending_review: "bg-orange-500/20 text-orange-500",
    completed: "bg-green-500/20 text-green-500",
    disputed: "bg-red-500/20 text-red-500",
    refunded: "bg-gray-500/20 text-gray-500",
    cancelled: "bg-gray-500/20 text-gray-500",
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/disputes">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Disputes
              {stats.pendingDisputes > 0 && (
                <Badge variant="destructive" className="ml-2">{stats.pendingDisputes}</Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PROs</p>
                <p className="text-xl font-bold">{stats.totalPros}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20">
                <Package className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Disputes</p>
                <p className="text-xl font-bold">{stats.pendingDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Wallet className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-xl font-bold">{stats.pendingWithdrawals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass hover:border-primary/50 transition-colors cursor-pointer" asChild>
          <Link href="/admin/users">
            <CardHeader className="pb-2">
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>View, edit, ban users and PROs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0">
                Manage <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="glass hover:border-primary/50 transition-colors cursor-pointer" asChild>
          <Link href="/admin/disputes">
            <CardHeader className="pb-2">
              <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
              <CardTitle>Disputes</CardTitle>
              <CardDescription>Resolve client disputes and refunds</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0">
                View Disputes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="glass hover:border-primary/50 transition-colors cursor-pointer" asChild>
          <Link href="/admin/withdrawals">
            <CardHeader className="pb-2">
              <DollarSign className="h-8 w-8 text-success mb-2" />
              <CardTitle>Withdrawals</CardTitle>
              <CardDescription>Process PRO payout requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0">
                Process Payouts <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={order.client?.avatar_url || ""} />
                        <AvatarFallback>{order.client?.email?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{order.service?.title || "Service"}</p>
                        <p className="text-xs text-muted-foreground">{order.order_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(order.total_cents)}</span>
                      <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user: Profile) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>{user.email?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.username || user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={user.role === "pro" ? "default" : user.role === "admin" ? "destructive" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
