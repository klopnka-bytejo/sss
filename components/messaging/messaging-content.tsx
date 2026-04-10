'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, AlertCircle, Send } from 'lucide-react'

interface Conversation {
  id: string
  order_id: string
  order_number: string
  service_title: string
  other_user_name: string
  other_user_avatar: string | null
  last_message: string
  created_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar: string | null
  content: string
  created_at: string
}

export function MessagingContent() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      console.log('[v0] Fetching conversations...')
      const response = await fetch('/api/messages')

      if (!response.ok) {
        setError(`Failed to fetch conversations: ${response.status}`)
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('[v0] Fetched conversations:', data.conversations?.length || 0)
      setConversations(data.conversations || [])
      setError(null)
    } catch (error) {
      console.error('[v0] Error fetching conversations:', error)
      setError(`Error fetching conversations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('[v0] Fetching messages for:', conversationId)
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)

      if (!response.ok) {
        setError(`Failed to fetch messages: ${response.status}`)
        return
      }

      const data = await response.json()
      console.log('[v0] Fetched messages:', data.messages?.length || 0)
      setMessages(data.messages || [])
      setError(null)
    } catch (error) {
      console.error('[v0] Error fetching messages:', error)
      setError(`Error fetching messages: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    setSendingMessage(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageInput,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.message])
        setMessageInput('')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('[v0] Error sending message:', error)
      alert('Error sending message')
    } finally {
      setSendingMessage(false)
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
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen">
      {/* Conversations List */}
      <Card className="lg:col-span-1 overflow-hidden">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 lg:h-full">
            <div className="space-y-1 p-4">
              {conversations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No conversations yet</p>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.other_user_avatar || undefined} />
                        <AvatarFallback>{conversation.other_user_name?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{conversation.other_user_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{conversation.service_title}</p>
                        <p className="text-xs truncate opacity-70">{conversation.last_message}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <Card className="h-full flex flex-col overflow-hidden">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.other_user_avatar || undefined} />
                    <AvatarFallback>{selectedConversation.other_user_name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedConversation.other_user_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedConversation.service_title}</p>
                  </div>
                </div>
                <Badge variant="outline">{selectedConversation.order_number}</Badge>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.sender_avatar || undefined} />
                        <AvatarFallback>{message.sender_name?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{message.sender_name}</p>
                        <div className="bg-muted p-3 rounded-lg mt-1 max-w-xs">
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={sendingMessage}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageInput.trim()}
                  className="gap-2"
                >
                  {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </Card>
        )}
      </div>
    </div>
  )
}
