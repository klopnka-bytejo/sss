"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Package, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
  ArrowRight,
  ShoppingBag
} from "lucide-react"
import type { Order, Profile, OrderStatus } from "@/lib/types"

interface OrdersContentProps {
  orders: Order[]
  user: Profile
}

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", icon: Clock, variant: "secondary" },
  paid: { label: "Awaiting PRO", icon: Clock, variant: "secondary" },
  in_progress: { label: "In Progress", icon: Package, variant: "default" },
  pending_review: { label: "Pending Review", icon: Clock, variant: "secondary" },
  completed: { label: "Completed", icon: CheckCircle2, variant: "secondary" },
  disputed: { label: "Disputed", icon: AlertTriangle, variant: "destructive" },
  refunded: { label: "Refunded", icon: XCircle, variant: "outline" },
  cancelled: { label: "Cancelled", icon: XCircle, variant: "outline" },
}

export function OrdersContent({ orders, user }: OrdersContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your service orders
          </p>
        </div>
        <Button asChild>
          <Link href="/browse-services">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Services
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-input">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon
            return (
              <Card key={order.id} className="glass hover:glow-primary transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-muted-foreground">
                            {order.order_number}
                          </span>
                          <Badge variant={status.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">
                          {(order as Order & { service?: { title: string } }).service?.title || "Service"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ordered on {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(order.total_cents)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.payment_status === "paid" ? "Paid" : "Awaiting payment"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}/messages`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            Details
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {orders.length === 0 
                ? "You haven't placed any orders yet. Browse our services to get started!"
                : "No orders match your current filters."
              }
            </p>
            {orders.length === 0 ? (
              <Button asChild>
                <Link href="/browse-services">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Services
                </Link>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
