'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import useSWR from 'swr'

interface Message {
  id: string
  order_id: string
  sender_id: string
  sender_name?: string
  avatar_url?: string
  message: string
  is_system?: boolean
  created_at: string
}

interface OrderChatProps {
  orderId: string
  userId: string
  userDisplayName: string
  userAvatar?: string
}

const fetcher = (url: string) =>
  fetch(url, {
    headers: { 'x-user-id': localStorage.getItem('user_id') || '' }
  }).then(r => r.json())

export function OrderChat({ orderId, userId, userDisplayName, userAvatar }: OrderChatProps) {
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messagesData, mutate: refetchMessages, isLoading } = useSWR(
    `/api/orders/${orderId}/messages`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 3000 }
  )

  const messages: Message[] = messagesData?.messages || []

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    setSendingMessage(true)
    setError(null)

    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ message: messageText })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send message')
        return
      }

      setMessageText('')
      refetchMessages()
    } catch (err) {
      setError('Failed to send message')
      console.error('Send message error:', err)
    } finally {
      setSendingMessage(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card className="flex flex-col h-96">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Order Chat</CardTitle>
        <CardDescription>Communicate with the other party about this order</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender_id === userId ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={msg.avatar_url} />
                  <AvatarFallback>{getInitials(msg.sender_name)}</AvatarFallback>
                </Avatar>

                <div
                  className={`flex flex-col gap-1 max-w-xs ${
                    msg.sender_id === userId ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="text-xs text-muted-foreground px-3">
                    <span className="font-medium">{msg.sender_name}</span>
                    <span className="ml-2">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {msg.is_system ? (
                    <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground italic">
                      {msg.message}
                    </div>
                  ) : (
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        msg.sender_id === userId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <div className="border-t p-4 space-y-2">
        {error && (
          <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={sendingMessage}
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={sendingMessage || !messageText.trim()}
            size="icon"
          >
            {sendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          {messageText.length}/500
        </p>
      </div>
    </Card>
  )
}
