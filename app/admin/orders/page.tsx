"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Package, 
  Search, 
  Eye, 
  UserPlus, 
  RefreshCw, 
  Ban, 
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import type { Order, Profile } from "@/lib/types"
import Link from "next/link"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  paid: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  assigned: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  in_progress: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  pending_review: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  released: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  refunded: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  disputed: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { client?: Profile; pro?: Profile })[]>([])
  const [pros, setPros] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedProId, setSelectedProId] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [ordersRes, prosRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*, client:profiles!orders_client_id_fkey(*), pro:profiles!orders_pro_id_fkey(*), service:services(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "pro")
        .eq("status", "active"),
    ])
    setOrders(ordersRes.data || [])
    setPros(prosRes.data || [])
    setLoading(false)
  }

  async function handleAssignPro() {
    if (!selectedOrder || !selectedProId) return
    
    await supabase
      .from("orders")
      .update({ 
        pro_id: selectedProId, 
        status: "assigned",
        updated_at: new Date().toISOString()
      })
      .eq("id", selectedOrder.id)
    
    setAssignDialogOpen(false)
    setSelectedProId("")
    fetchData()
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId)
    fetchData()
  }

  async function handleReleasePayout(order: Order) {
    if (!confirm("Release payout to PRO? This action cannot be undone.")) return
    
    // Update order status
    await supabase
      .from("orders")
      .update({ 
        status: "released", 
        payout_released_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id)
    
    // Add to PRO wallet
    if (order.pro_id) {
      const platformFee = Math.round(order.total_cents * 0.15) // 15% platform fee
      const proPayout = order.total_cents - platformFee
      
      await supabase.from("wallet_transactions").insert({
        user_id: order.pro_id,
        type: "earning",
        amount_cents: proPayout,
        status: "completed",
        description: `Payout for order #${order.order_number}`,
        order_id: order.id,
      })
    }
    
    fetchData()
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesSearch = search === "" || 
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.client?.display_name?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">View and manage all orders</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Waiting PRO", status: "paid", icon: Clock, color: "text-blue-500" },
            { label: "In Progress", status: "in_progress", icon: RefreshCw, color: "text-cyan-500" },
            { label: "Pending Review", status: "pending_review", icon: AlertTriangle, color: "text-orange-500" },
            { label: "Completed", status: "released", icon: CheckCircle, color: "text-green-500" },
            { label: "Disputed", status: "disputed", icon: Ban, color: "text-red-500" },
          ].map((stat) => (
            <Card key={stat.status} className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter(stat.status)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === stat.status).length}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order # or client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Waiting for PRO</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")}>
                  Clear filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>PRO</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        #{order.order_number}
                      </TableCell>
                      <TableCell>
                        {order.client?.display_name || `Client #${order.client_id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {(order.service as any)?.title || "Service"}
                      </TableCell>
                      <TableCell>
                        {order.pro ? (
                          <span className="text-primary">{order.pro.display_name}</span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total_cents)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status] || ""}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!order.pro_id && order.status === "paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedOrder(order)
                                setAssignDialogOpen(true)
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === "pending_review" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReleasePayout(order)}
                              className="text-green-500"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Release
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Assign PRO Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign PRO to Order</DialogTitle>
              <DialogDescription>
                Manually assign a PRO to order #{selectedOrder?.order_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={selectedProId} onValueChange={setSelectedProId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a PRO" />
                </SelectTrigger>
                <SelectContent>
                  {pros.map((pro) => (
                    <SelectItem key={pro.id} value={pro.id}>
                      {pro.display_name} ({pro.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignPro} disabled={!selectedProId}>
                  Assign PRO
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
