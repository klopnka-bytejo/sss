'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Eye, Loader2 } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending_assignment: 'bg-yellow-500/20 text-yellow-500',
  assigned: 'bg-blue-500/20 text-blue-500',
  in_progress: 'bg-purple-500/20 text-purple-500',
  completed: 'bg-green-500/20 text-green-500',
  disputed: 'bg-red-500/20 text-red-500',
  refunded: 'bg-gray-500/20 text-gray-500',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [pros, setPros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null)
  const [selectedProId, setSelectedProId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending_assignment')

  useEffect(() => {
    fetchOrders()
    fetchPros()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        credentials: 'include',
      })
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('[v0] Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPros = async () => {
    try {
      const res = await fetch('/api/admin/pros', {
        credentials: 'include',
      })
      const data = await res.json()
      setPros(data.pros || [])
    } catch (error) {
      console.error('[v0] Failed to fetch pros:', error)
    }
  }

  const handleAssignPro = async (orderId: string, proId: string) => {
    if (!proId) return

    try {
      const res = await fetch('/api/admin/assign-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId, proId }),
      })

      if (res.ok) {
        fetchOrders()
        setAssigningOrderId(null)
        setSelectedProId('')
      }
    } catch (error) {
      console.error('[v0] Failed to assign order:', error)
    }
  }

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order.order_number?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">Assign PROs to pending orders and manage all orders</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_assignment">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>{filteredOrders.length} orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders found</p>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-mono text-sm font-semibold">{order.order_number}</p>
                        <Badge className={statusColors[order.status] || 'bg-gray-500/20 text-gray-500'}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(order.amount_cents || 0)} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {order.status === 'pending_assignment' ? (
                      assigningOrderId === order.id ? (
                        <div className="flex gap-2 items-center">
                          <Select value={selectedProId} onValueChange={setSelectedProId}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select PRO" />
                            </SelectTrigger>
                            <SelectContent>
                              {pros.map((pro: any) => (
                                <SelectItem key={pro.id} value={pro.id}>
                                  {pro.display_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleAssignPro(order.id, selectedProId)}
                            disabled={!selectedProId}
                            size="sm"
                            className="gradient-primary"
                          >
                            Assign
                          </Button>
                          <Button
                            onClick={() => setAssigningOrderId(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setAssigningOrderId(order.id)}
                          size="sm"
                          className="gradient-primary"
                        >
                          Assign PRO
                        </Button>
                      )
                    ) : (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
