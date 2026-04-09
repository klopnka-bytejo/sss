'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare, Search, AlertTriangle, Eye, Clock, Users, Send, Loader2 } from 'lucide-react'

interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  participant_1_name: string
  participant_1_email: string
  participant_2_name: string
  participant_2_email: string
  last_message: string
  last_message_at: string
  message_count: number
  unread_count: number
}

export default function AdminChatMonitoringPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/messages')
      const data = await res.json()
      setConversations(data.conversations || [])
      
      // Calculate total unread messages
      const unreadTotal = (data.conversations || []).reduce((sum: number, conv: Conversation) => {
        return sum + (conv.message_count || 0)
      }, 0)
      setTotalUnread(unreadTotal)
    } catch (error) {
      console.error('[v0] Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${orderId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    fetchMessages(conv.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    console.log('[v0] Sending message:', {
      recipientId: selectedConversation.participant_1_id,
      messageLength: newMessage.length,
    })

    setSending(true)
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipientId: selectedConversation.participant_1_id,
          message: newMessage,
        }),
      })

      const data = await res.json()
      console.log('[v0] Send response:', { status: res.status, data })

      if (res.ok) {
        console.log('[v0] Message sent successfully')
        setNewMessage('')
        fetchMessages(selectedConversation.id)
        fetchConversations()
      } else {
        console.error('[v0] Failed to send message:', data)
      }
    } catch (error) {
      console.error('[v0] Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participant_1_name?.toLowerCase().includes(search.toLowerCase()) ||
    conv.participant_2_name?.toLowerCase().includes(search.toLowerCase()) ||
    conv.participant_1_email?.toLowerCase().includes(search.toLowerCase()) ||
    conv.participant_2_email?.toLowerCase().includes(search.toLowerCase())
  )

  const flaggedCount = 0 // No flagging system yet
  const activeCount = conversations.length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat Monitoring</h1>
          <p className="text-muted-foreground">Monitor and moderate user conversations</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold">{conversations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Chats</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Flagged</p>
                  <p className="text-2xl font-bold">{flaggedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Conversation List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading...</p>
                ) : filteredConversations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No conversations</p>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                          selectedConversation?.id === conv.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {conv.participant_1_name} & {conv.participant_2_name}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.participant_1_email} • {conv.participant_2_email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {conv.last_message || 'No messages yet'}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant="secondary" className="text-xs">
                              {conv.message_count}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.last_message_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message View */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedConversation ? (
                  <div className="flex items-center justify-between">
                    <span>Conversation</span>
                    <Badge variant="secondary">
                      {selectedConversation.message_count} messages
                    </Badge>
                  </div>
                ) : (
                  'Select a conversation'
                )}
              </CardTitle>
              {selectedConversation && (
                <CardDescription>
                  {selectedConversation.participant_1_name} and {selectedConversation.participant_2_name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!selectedConversation ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p>Select a conversation to view messages</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No messages</p>
                    ) : (
                      messages.map((msg, idx) => (
                        <div key={idx} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {msg.sender_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{msg.sender_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm bg-accent/50 p-3 rounded-lg">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Message Composer */}
              {selectedConversation && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                    />
                    <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
