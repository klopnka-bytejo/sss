'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, AlertCircle, Star, MessageSquare } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  service_title: string
  service_category: string
  service_game: string
  delivery_time: string
  pro_name: string
  pro_avatar: string | null
  pro_rating: number
  pro_total_orders: number
  amount_cents: number
  status: string
  payment_status: string
  notes: string
  created_at: string
  updated_at: string
}

export function ClientOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log('[v0] Fetching client orders...')
      const response = await fetch('/api/client/orders')

      if (!response.ok) {
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

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <p className="font-semibold">Error Loading Orders</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your service orders</p>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
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
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>
                {statusFilter === 'all'
                  ? 'No orders yet. Visit the marketplace to get started!'
                  : `No ${statusFilter} orders.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>PRO</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.service_title}</p>
                          <p className="text-xs text-muted-foreground">{order.service_game || 'General'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={order.pro_avatar || undefined} />
                            <AvatarFallback>{order.pro_name?.slice(0, 2) || 'N/A'}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">{order.pro_name || 'Unassigned'}</p>
                            {order.pro_rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs">{order.pro_rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.amount_cents)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(order.payment_status)}>
                          {order.payment_status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedOrder(order)}
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Message
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Order {order.order_number}</DialogTitle>
                              <DialogDescription>
                                Service: {order.service_title}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {/* Order Details */}
                              <div className="space-y-2 text-sm border-b pb-4">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Amount:</span>
                                  <span className="font-semibold">{formatCurrency(order.amount_cents)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status:</span>
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Delivery:</span>
                                  <span>{order.delivery_time}</span>
                                </div>
                              </div>

                              {/* PRO Info */}
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={order.pro_avatar || undefined} />
                                  <AvatarFallback>{order.pro_name?.slice(0, 2) || 'N/A'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{order.pro_name || 'Unassigned'}</p>
                                  {order.pro_rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                      <span className="text-xs text-muted-foreground">
                                        {order.pro_rating.toFixed(1)} ({order.pro_total_orders} orders)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Notes */}
                              {order.notes && (
                                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                                  <p className="font-medium mb-1">Your Notes:</p>
                                  <p className="text-muted-foreground">{order.notes}</p>
                                </div>
                              )}

                              {/* Messaging Feature */}
                              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Open Chat with PRO
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
