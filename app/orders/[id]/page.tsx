'use client'

// Order chat page - client and pro communication
import { useEffect, useRef, useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatDate(date: string) {
  return new Date(date).toLocaleString()
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
  delivered: CheckCircle,
}

export default function OrderChatPage() {
  const params = useParams()
  const orderId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [order, setOrder] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchOrderAndMessages()
    const interval = setInterval(fetchOrderAndMessages, 3000)
    return () => clearInterval(interval)
  }, [orderId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchOrderAndMessages = async () => {
    try {
      // Get order details (you'd need to create this API)
      const orderRes = await fetch(`/api/orders/${orderId}`)
      if (orderRes.ok) {
        const orderData = await orderRes.json()
        setOrder(orderData.order)
      }

      // Get messages
      const messagesRes = await fetch(`/api/orders/${orderId}/messages`)
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        setMessages(messagesData.messages || [])
      }
    } catch (error) {
      console.error('[v0] Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    setSending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText,
          messageType: 'text',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...messages, data.message])
        setMessageText('')
      }
    } catch (error) {
      console.error('[v0] Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="py-8 text-center">Loading order chat...</div>
      </AppLayout>
    )
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="py-8 text-center">Order not found</div>
      </AppLayout>
    )
  }

  const StatusIcon = statusIcons[order.status] || AlertCircle

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{order.service_title}</h1>
              <p className="text-gray-600">{order.game_name}</p>
            </div>
          </div>
          <Badge className={statusColors[order.status]}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {order.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Order ID:</span>
                <span className="ml-2 font-mono">{order.order_number}</span>
              </div>
              <div>
                <span className="text-gray-600">Amount:</span>
                <span className="ml-2 font-semibold">{formatCurrency(order.amount_cents)}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">{formatDate(order.created_at)}</span>
              </div>
              {order.accepted_at && (
                <div>
                  <span className="text-gray-600">Accepted:</span>
                  <span className="ml-2">{formatDate(order.accepted_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Client:</span>
                <span className="ml-2">{order.client_name}</span>
              </div>
              {order.pro_id && (
                <div>
                  <span className="text-gray-600">Pro:</span>
                  <span className="ml-2">{order.pro_name || 'Assigned'}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Client Notes */}
        {order.client_notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Client Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{order.client_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Chat */}
        <Card className="flex flex-col h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 p-0 pl-6 pr-6">
            <ScrollArea className="flex-1">
              <div className="space-y-4 pb-4">
                {messages.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.is_system ? 'justify-center' : ''
                      }`}
                    >
                      {!message.is_system && (
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {message.sender_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                        </div>
                      )}
                      {message.is_system && (
                        <div className="text-xs text-gray-500 italic">
                          {message.content}
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {order.status !== 'delivered' && (
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t">
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || !messageText.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
