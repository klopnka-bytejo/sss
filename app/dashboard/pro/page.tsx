'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  MessageSquare,
  Package,
} from 'lucide-react'
import Link from 'next/link'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  accepted: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-600 border-green-500/30',
  delivered: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
}

const statusIcons: Record<string, typeof AlertCircle> = {
  pending: AlertCircle,
  accepted: Clock,
  completed: CheckCircle,
  delivered: Package,
}

export default function ProDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('pending')
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    // Poll for new orders every 5 seconds
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('[v0] Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingOrder(orderId)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'accept',
          proNotes: 'I will start working on this immediately.',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setOrders(orders.map(o => o.id === orderId ? data.order : o))
      }
    } catch (error) {
      console.error('[v0] Failed to accept order:', error)
    } finally {
      setAcceptingOrder(null)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'complete',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setOrders(orders.map(o => o.id === orderId ? data.order : o))
      }
    } catch (error) {
      console.error('[v0] Failed to complete order:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'pending') return order.status === 'pending'
    if (selectedTab === 'active') return ['accepted', 'completed'].includes(order.status)
    if (selectedTab === 'delivered') return order.status === 'delivered'
    return true
  })

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => ['accepted', 'completed'].includes(o.status)).length,
    totalEarnings: orders
      .filter(o => ['delivered', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + (o.pro_payout_cents || 0), 0),
  }

  return (
    <AppLayout userRole="pro">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending}</div>
              <p className="text-xs text-gray-500">Waiting for you to accept</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
              <p className="text-xs text-gray-500">In progress or completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
              <p className="text-xs text-gray-500">From delivered orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
              </TabsList>

              {loading ? (
                <div className="py-8 text-center text-gray-500">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No {selectedTab} orders yet
                </div>
              ) : (
                <TabsContent value={selectedTab} className="space-y-4">
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || AlertCircle
                    return (
                      <div
                        key={order.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <StatusIcon className="w-5 h-5 mt-1 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold">{order.service_title}</h3>
                              <p className="text-sm text-gray-600">{order.game_name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Order: {order.order_number}
                              </p>
                            </div>
                            <Badge className={statusColors[order.status]}>
                              {order.status}
                            </Badge>
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              Payout: {formatCurrency(order.pro_payout_cents)}
                            </span>
                            <span className="text-gray-600">
                              Client: {order.client_name}
                            </span>
                          </div>

                          {order.client_notes && (
                            <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              <strong>Client Notes:</strong> {order.client_notes}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleAcceptOrder(order.id)}
                              disabled={acceptingOrder === order.id}
                            >
                              {acceptingOrder === order.id ? 'Accepting...' : 'Accept'}
                            </Button>
                          )}

                          {order.status === 'accepted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              Mark Complete
                            </Button>
                          )}

                          {['accepted', 'completed'].includes(order.status) && (
                            <Link href={`/orders/${order.id}`}>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Chat
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
