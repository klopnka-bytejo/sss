'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ArrowRight, Package, MessageSquare, Clock, DollarSign, User } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  status: string
  amount_cents: number
  client_id: string
  client_name: string
  client_email: string
  service_title: string
  pro_id?: string
  created_at: string
  updated_at: string
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paid - Awaiting PRO', color: 'bg-yellow-500/20 text-yellow-600' },
  assigned: { label: 'Assigned', color: 'bg-blue-500/20 text-blue-600' },
  in_progress: { label: 'In Progress', color: 'bg-purple-500/20 text-purple-600' },
  pending_review: { label: 'Pending Review', color: 'bg-orange-500/20 text-orange-600' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-600' },
  released: { label: 'Released', color: 'bg-green-600/20 text-green-700' },
  disputed: { label: 'Disputed', color: 'bg-red-500/20 text-red-600' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-600' },
}

export default function ProOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/pros/orders', {
        credentials: 'include',
      })

      if (!response.ok) {
        // Don't redirect - just show empty state
        // User might need to re-login to refresh their session
        console.error('[v0] Failed to fetch orders:', response.status)
        setOrders([])
        return
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('[v0] Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const activeOrders = orders.filter(o => ['assigned', 'in_progress'].includes(o.status))
  const pendingOrders = orders.filter(o => ['pending_review'].includes(o.status))
  const completedOrders = orders.filter(o => ['completed', 'released'].includes(o.status))

  if (loading) {
    return (
      <AppLayout userRole="pro">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout userRole="pro">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Manage your assigned orders</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/pro/available">
              Browse Available Orders
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{pendingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Review ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {activeOrders.length === 0 ? (
              <EmptyState message="No active orders" />
            ) : (
              activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingOrders.length === 0 ? (
              <EmptyState message="No orders pending review" />
            ) : (
              pendingOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedOrders.length === 0 ? (
              <EmptyState message="No completed orders yet" />
            ) : (
              completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-4">
            {orders.length === 0 ? (
              <EmptyState message="No orders yet. Check available orders to get started!" />
            ) : (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

function OrderCard({ order }: { order: Order }) {
  const status = statusConfig[order.status] || { label: order.status, color: 'bg-gray-500/20 text-gray-600' }
  
  return (
    <Card className="glass hover:glass-hover transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">#{order.order_number}</h3>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{order.service_title}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-500">{formatCurrency(Math.round(order.amount_cents * 0.85))}</p>
            <p className="text-xs text-muted-foreground">Your payout (85%)</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{order.client_name || order.client_email || 'Client'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/${order.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/orders/${order.id}`}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{message}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/pro/available">Browse Available Orders</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
