'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MoreVertical, Trash2, MessageSquare, Loader2 } from 'lucide-react'

interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  participant_1_name: string
  participant_1_email: string
  participant_1_avatar: string | null
  participant_2_name: string
  participant_2_email: string
  participant_2_avatar: string | null
  last_message: string | null
  message_count: number
  unread_count: number
  last_message_at: string | null
  created_at: string
}

interface AdminConversationsContentProps {
  userId: string
}

export function AdminConversationsContent({ userId }: AdminConversationsContentProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch conversations from API on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        console.log('[v0] Fetching conversations from API...')
        const response = await fetch('/api/admin/conversations')
        console.log('[v0] API Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[v0] API error:', response.status, errorText)
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

    fetchConversations()
  }, [])

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      conv.participant_1_name.toLowerCase().includes(searchLower) ||
      conv.participant_1_email.toLowerCase().includes(searchLower) ||
      conv.participant_2_name.toLowerCase().includes(searchLower) ||
      conv.participant_2_email.toLowerCase().includes(searchLower) ||
      (conv.last_message && conv.last_message.toLowerCase().includes(searchLower))
    )
  })

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation and all its messages?')) {
      return
    }

    setDeleting(conversationId)
    try {
      const response = await fetch(`/api/admin/conversations?id=${conversationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConversations(conversations.filter((c) => c.id !== conversationId))
      } else {
        alert('Failed to delete conversation')
      }
    } catch (error) {
      console.error('[v0] Error deleting conversation:', error)
      alert('Error deleting conversation')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string) => {
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
        <p className="font-semibold">Error Loading Conversations</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Conversations Table */}
      <Card>
        <CardContent className="p-0">
          {filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              {conversations.length === 0 ? 'No conversations yet' : 'No conversations match your search'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participants</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Unread</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversations.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={conv.participant_1_avatar || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(conv.participant_1_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">{conv.participant_1_name}</p>
                            <p className="text-xs text-muted-foreground">{conv.participant_1_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={conv.participant_2_avatar || undefined} />
                            <AvatarFallback className="bg-purple-500 text-white text-xs">
                              {getInitials(conv.participant_2_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">{conv.participant_2_name}</p>
                            <p className="text-xs text-muted-foreground">{conv.participant_2_email}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate text-muted-foreground">
                        {conv.last_message || 'No messages'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{conv.message_count}</Badge>
                    </TableCell>
                    <TableCell>
                      {conv.unread_count > 0 ? (
                        <Badge className="bg-red-500">{conv.unread_count}</Badge>
                      ) : (
                        <Badge variant="outline">0</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(conv.last_message_at || conv.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={deleting === conv.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            View Conversation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteConversation(conv.id)}
                            disabled={deleting === conv.id}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
