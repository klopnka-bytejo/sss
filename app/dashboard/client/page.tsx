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
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
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

export default function ClientDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('active')

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/my-orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('[v0] Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'active') return ['pending', 'accepted', 'completed'].includes(order.status)
    if (selectedTab === 'delivered') return order.status === 'delivered'
    return true
  })

  const stats = {
    active: orders.filter(o => ['pending', 'accepted', 'completed'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalSpent: orders.reduce((sum, o) => sum + (o.amount_cents || 0), 0),
  }

  return (
    <AppLayout userRole="client">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
              <p className="text-xs text-gray-500">In progress or waiting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-gray-500">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.totalSpent)}</div>
              <p className="text-xs text-gray-500">All orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
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
                              {formatCurrency(order.amount_cents)}
                            </span>
                            <span className="text-gray-600">
                              Created: {formatDate(order.created_at)}
                            </span>
                          </div>

                          {order.pro_id && (
                            <p className="mt-2 text-sm text-green-600">
                              ✓ Pro assigned: Working on your order
                            </p>
                          )}
                        </div>

                        <Link href={`/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        </Link>
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
