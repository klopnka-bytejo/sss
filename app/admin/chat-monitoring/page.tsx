'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare, Search, AlertTriangle, Eye, Clock, Users } from 'lucide-react'

interface Conversation {
  id: string
  order_number: string
  client_name: string
  pro_name: string
  last_message: string
  last_message_time: string
  message_count: number
  has_flagged: boolean
  status: string
}

export default function AdminChatMonitoringPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/messages')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
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

  const filteredConversations = conversations.filter(conv =>
    conv.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    conv.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    conv.pro_name?.toLowerCase().includes(search.toLowerCase())
  )

  const flaggedCount = conversations.filter(c => c.has_flagged).length
  const activeCount = conversations.filter(c => c.status === 'in_progress').length

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
                                {conv.client_name} & {conv.pro_name}
                              </p>
                              {conv.has_flagged && (
                                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              Order: {conv.order_number}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {conv.last_message}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant="secondary" className="text-xs">
                              {conv.message_count}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.last_message_time).toLocaleDateString()}
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
                    <span>Order: {selectedConversation.order_number}</span>
                    <Badge variant={selectedConversation.has_flagged ? 'destructive' : 'secondary'}>
                      {selectedConversation.has_flagged ? 'Flagged' : selectedConversation.status}
                    </Badge>
                  </div>
                ) : (
                  'Select a conversation'
                )}
              </CardTitle>
              {selectedConversation && (
                <CardDescription>
                  {selectedConversation.client_name} (Client) and {selectedConversation.pro_name} (PRO)
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
                        <div
                          key={idx}
                          className={`flex gap-3 ${msg.is_system ? 'justify-center' : ''}`}
                        >
                          {msg.is_system ? (
                            <div className="bg-muted px-4 py-2 rounded-lg text-sm text-muted-foreground">
                              {msg.message}
                            </div>
                          ) : (
                            <>
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
                                  {msg.sender_role === 'pro' && (
                                    <Badge variant="secondary" className="text-xs">PRO</Badge>
                                  )}
                                </div>
                                <p className="text-sm bg-accent/50 p-3 rounded-lg">
                                  {msg.message}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
