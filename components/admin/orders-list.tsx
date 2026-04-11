'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Order {
  id: string
  order_number: string
  status: string
  amount_cents: number
  client_id: string
  service_id: string
  created_at: string
}

interface ProProfile {
  user_id: string
  display_name: string
  rating: number
  total_orders: number
}

export function AdminOrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [proList, setProList] = useState<ProProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [selectedPro, setSelectedPro] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    fetchProList()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log('[v0] Admin orders: Fetching orders')
      const res = await fetch('/api/orders?role=admin', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        console.log('[v0] Admin orders: Loaded', data.orders?.length || 0, 'orders')
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('[v0] Admin orders: Failed to fetch:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchProList = async () => {
    try {
      console.log('[v0] Admin orders: Fetching PRO list')
      const res = await fetch('/api/pro-profiles', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        console.log('[v0] Admin orders: Loaded', data.professionals?.length || 0, 'PROs')
        setProList(data.professionals || [])
      }
    } catch (err) {
      console.error('[v0] Admin orders: Failed to fetch PROs:', err)
    }
  }

  const handleAssignPro = async (orderId: string) => {
    const proId = selectedPro[orderId]
    if (!proId) {
      setError('Please select a PRO')
      return
    }

    setAssigning(orderId)
    setError(null)

    try {
      console.log('[v0] Admin orders: Assigning order', orderId, 'to PRO', proId)
      const res = await fetch('/api/admin/assign-order', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, proId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to assign order')
        setAssigning(null)
        return
      }

      console.log('[v0] Admin orders: Order assigned successfully')
      setSuccess('Order assigned successfully')
      setTimeout(() => setSuccess(null), 2000)
      
      // Refresh orders list
      fetchOrders()
      setSelectedPro(prev => {
        const newState = { ...prev }
        delete newState[orderId]
        return newState
      })
    } catch (err) {
      console.error('[v0] Admin orders: Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setAssigning(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'Pending Assignment')

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-100 border border-green-300 text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="space-y-4">
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No pending orders to assign</p>
            </CardContent>
          </Card>
        ) : (
          pendingOrders.map(order => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order</p>
                    <p className="font-mono text-sm">{order.order_number}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                    <p className="font-semibold">{formatCurrency(order.amount_cents)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>

                  <div className="space-y-2">
                    <Select value={selectedPro[order.id] || ''} onValueChange={(value) => setSelectedPro(prev => ({ ...prev, [order.id]: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PRO..." />
                      </SelectTrigger>
                      <SelectContent>
                        {proList.map(pro => (
                          <SelectItem key={pro.user_id} value={pro.user_id}>
                            {pro.display_name} ({pro.rating || 0}★)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => handleAssignPro(order.id)}
                      disabled={assigning === order.id || !selectedPro[order.id]}
                      className="w-full"
                    >
                      {assigning === order.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        'Assign'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
