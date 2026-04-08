"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Send, Shield, AlertTriangle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  order_id: string
  sender_id: string
  content: string
  created_at: string
  is_system?: boolean
  sender?: {
    username: string
    role: string
  }
}

interface OrderChatProps {
  orderId: string
  currentUserId: string
  currentUserRole: "client" | "pro" | "admin"
  orderStatus: string
  otherPartyName?: string
}

// Blocked patterns for chat moderation
const BLOCKED_PATTERNS = [
  // Social media
  /discord/i, /\bdc\b/i,
  /instagram/i, /\big\b/i,
  /facebook/i, /\bfb\b/i,
  /snapchat/i, /\bsnap\b/i,
  /whatsapp/i, /\bwa\b/i,
  /telegram/i, /\btg\b/i,
  /twitter/i, /\btw\b/i,
  /tiktok/i,
  // Contact info
  /phone|call me|my number/i,
  /\+\d{10,}/,  // Phone numbers
  /\b[\w.-]+@[\w.-]+\.\w{2,}\b/,  // Email addresses
  // External contact attempts
  /add me|dm me|message me|contact me outside/i,
  /pay outside|venmo|paypal|cashapp|zelle/i,
]

function isMessageBlocked(content: string): { blocked: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(content)) {
      return { 
        blocked: true, 
        reason: "This message contains content that violates platform security rules." 
      }
    }
  }
  return { blocked: false }
}

export function OrderChat({ 
  orderId, 
  currentUserId, 
  currentUserRole, 
  orderStatus,
  otherPartyName 
}: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const isChatEnabled = ["assigned", "in_progress", "awaiting_customer_info"].includes(orderStatus)

  useEffect(() => {
    fetchMessages()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || sending || !isChatEnabled) return

    // Check for blocked content
    const { blocked, reason } = isMessageBlocked(newMessage)
    if (blocked) {
      setError(reason || "Message blocked")
      
      // Log moderation event
      await fetch("/api/moderation/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          message_content: newMessage,
          blocked_reason: reason
        })
      })
      
      return
    }

    setSending(true)
    setError(null)

    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage })
      })

      if (res.ok) {
        setNewMessage("")
      } else {
        const data = await res.json()
        setError(data.error || "Failed to send message")
      }
    } catch (err) {
      setError("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString([], {
      month: "short",
      day: "numeric"
    })
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentDate = ""
  
  for (const msg of messages) {
    const msgDate = formatDate(msg.created_at)
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groupedMessages.push({ date: msgDate, messages: [msg] })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg)
    }
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0 border-b">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Order Chat
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Secure</span>
          </div>
        </CardTitle>
        {otherPartyName && (
          <p className="text-sm text-muted-foreground">
            Chatting with: <span className="font-medium">{otherPartyName}</span>
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground">
                {isChatEnabled ? "Start the conversation!" : "Chat will be available when a PRO is assigned"}
              </p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <Badge variant="secondary" className="text-xs">
                    {group.date}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {group.messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId
                    const isSystem = msg.is_system
                    
                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            {msg.content}
                          </p>
                        </div>
                      )
                    }
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={isOwn ? "bg-primary text-primary-foreground" : ""}>
                            {(msg.sender?.username || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-muted rounded-tl-sm"
                            }`}
                          >
                            <p className="text-sm break-words">{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 px-1">
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mx-4 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-card">
          {isChatEnabled ? (
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={sending}
              />
              <Button 
                onClick={handleSend} 
                disabled={!newMessage.trim() || sending}
                size="icon"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-2">
              {orderStatus === "paid_waiting_pro" 
                ? "Chat will be available once a PRO accepts this order"
                : "Chat is closed for this order"
              }
            </p>
          )}
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Messages are moderated. External contact attempts are blocked.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
