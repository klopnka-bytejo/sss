'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreVertical, Loader2, AlertCircle, Trash2 } from 'lucide-react'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
  sender_email: string
  sender_name: string
  sender_avatar: string | null
  recipient_email: string
  recipient_name: string
  recipient_avatar: string | null
  conversation_last_message: string
  conversation_created_at: string
}

export function AdminMessagesContent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log('[v0] Fetching all messages from API...')
        const response = await fetch('/api/admin/all-messages')
        console.log('[v0] API Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[v0] API error:', response.status, errorText)
          setError(`Failed to fetch messages: ${response.status}`)
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log('[v0] Fetched messages:', data.messages?.length || 0)
        setMessages(data.messages || [])
        setError(null)
      } catch (error) {
        console.error('[v0] Error fetching messages:', error)
        setError(`Error fetching messages: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    setDeleting(messageId)
    try {
      const response = await fetch('/api/admin/all-messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      })

      if (response.ok) {
        setMessages(messages.filter((m) => m.id !== messageId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete message')
      }
    } catch (error) {
      console.error('[v0] Error deleting message:', error)
      alert('Error deleting message')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.slice(0, 2).toUpperCase()
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
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold">Error Loading Messages</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages by content or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          {filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              {messages.length === 0 ? 'No messages in the system' : 'No messages match your search'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.sender_avatar || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(msg.sender_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">{msg.sender_name || 'Unknown'}</p>
                            <p className="text-muted-foreground text-xs">{msg.sender_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.recipient_avatar || undefined} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {getInitials(msg.recipient_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">{msg.recipient_name || 'Unknown'}</p>
                            <p className="text-muted-foreground text-xs">{msg.recipient_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm truncate">{msg.content}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={msg.is_read ? 'outline' : 'default'}>
                          {msg.is_read ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(msg.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={deleting === msg.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteMessage(msg.id)}
                              disabled={deleting === msg.id}
                              className="text-red-500"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
