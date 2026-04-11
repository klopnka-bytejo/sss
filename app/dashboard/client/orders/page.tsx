'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  status: string
  amount_cents: number
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
  })
}

const statusColors: Record<string, string> = {
  pending_assignment: 'bg-yellow-500/20 text-yellow-700',
  assigned: 'bg-blue-500/20 text-blue-700',
  in_progress: 'bg-purple-500/20 text-purple-700',
  completed: 'bg-green-500/20 text-green-700',
  refunded: 'bg-red-500/20 text-red-700',
}

const statusLabels: Record<string, string> = {
  pending_assignment: 'Pending Assignment',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  refunded: 'Refunded',
}

export default function ClientOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/client/orders', {
        credentials: 'include',
      })

      if (!response.ok) {
        router.push('/auth/login')
        return
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('[v0] Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your service orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending_assignment', 'assigned', 'in_progress', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All Orders' : statusLabels[status]}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">No orders found</p>
              <Button asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="glass hover:glass-hover transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status] || 'bg-gray-500/20'}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-xl font-bold text-gradient">
                          {formatCurrency(order.amount_cents)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">
                          {order.pro_id ? 'PRO Assigned' : 'Awaiting Assignment'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/client/orders/${order.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
