'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreVertical, Loader2, AlertCircle } from 'lucide-react'
import { AssignPRODialog } from './assign-pro-dialog'

interface Order {
  id: string
  order_number: string
  amount_cents: number
  platform_fee_cents: number
  pro_payout_cents: number
  status: string
  payment_status: string
  payment_method: string
  notes: string
  created_at: string
  updated_at: string
  client_email: string
  client_name: string
  pro_email: string
  pro_name: string
  service_title: string
  service_category: string
  service_price: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  in_progress: 'bg-blue-500/20 text-blue-500',
  completed: 'bg-green-500/20 text-green-500',
  cancelled: 'bg-red-500/20 text-red-500',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  paid: 'bg-green-500/20 text-green-500',
  failed: 'bg-red-500/20 text-red-500',
}

export function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('[v0] Fetching orders from API...')
        const response = await fetch('/api/admin/orders')
        console.log('[v0] API Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[v0] API error:', response.status, errorText)
          setError(`Failed to fetch orders: ${response.status}`)
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log('[v0] Fetched orders:', data.orders?.length || 0)
        setOrders(data.orders || [])
        setError(null)
      } catch (error) {
        console.error('[v0] Error fetching orders:', error)
        setError(`Error fetching orders: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pro_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pro_email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'update_status', newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update order')
      }
    } catch (error) {
      console.error('[v0] Error updating order:', error)
      alert('Error updating order')
    } finally {
      setUpdating(false)
    }
  }

  const handleAssignPRO = async (orderId: string, proId: string) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'assign_pro', proId }),
      })

      if (response.ok) {
        setOrders(orders.map((o) => 
          o.id === orderId ? { ...o, pro_name: 'Assigned', pro_id: proId } : o
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign PRO')
      }
    } catch (error) {
      console.error('[v0] Error assigning PRO:', error)
      alert('Error assigning PRO')
    } finally {
      setUpdating(false)
    }
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
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold">Error Loading Orders</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, client, or PRO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              {orders.length === 0 ? 'No orders in the system' : 'No orders match your search'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>PRO</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{order.client_name || 'Unknown'}</p>
                          <p className="text-muted-foreground text-xs">{order.client_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{order.pro_name || 'Unassigned'}</p>
                          {order.pro_email && <p className="text-muted-foreground text-xs">{order.pro_email}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{order.service_title}</p>
                          <p className="text-muted-foreground text-xs">{order.service_category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold">{formatCurrency(order.amount_cents)}</div>
                        <div className="text-xs text-muted-foreground">PRO: {formatCurrency(order.pro_payout_cents)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status] || statusColors.pending}>
                          {(order.status || 'pending').replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentStatusColors[order.payment_status] || paymentStatusColors.pending}>
                          {(order.payment_status || 'pending').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={updating}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            {!order.pro_name || order.pro_name === 'Unassigned' ? (
                              <>
                                <DropdownMenuLabel>Assign PRO</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="p-2">
                                  <AssignPRODialog 
                                    orderId={order.id} 
                                    onAssign={(proId) => handleAssignPRO(order.id, proId)}
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(order.id, 'pending')}
                                  disabled={order.status === 'pending' || updating}
                                >
                                  Set as Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                                  disabled={order.status === 'in_progress' || updating}
                                >
                                  Set as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(order.id, 'completed')}
                                  disabled={order.status === 'completed' || updating}
                                >
                                  Set as Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                  disabled={order.status === 'cancelled' || updating}
                                >
                                  Set as Cancelled
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
