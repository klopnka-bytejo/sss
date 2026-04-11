'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2 } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipient: Profile
  onMessageSent?: () => void
}

export function SendMessageDialog({
  open,
  onOpenChange,
  recipient,
  onMessageSent,
}: SendMessageDialogProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Message cannot be empty')
      return
    }

    setLoading(true)
    try {
      console.log('[v0] Send dialog: Sending message to', recipient.id)
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: recipient.id,
          message: message.trim(),
        }),
      })

      console.log('[v0] Send dialog: Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Send dialog: Message sent successfully:', data.message.id)
        setMessage('')
        alert('Message sent successfully!')
        onOpenChange(false)
        onMessageSent?.()
      } else {
        const error = await response.json()
        console.error('[v0] Send dialog: API error:', error)
        alert(`Failed to send message: ${error.error || 'Unknown error'}${error.details ? ` (${error.details})` : ''}`)
      }
    } catch (error) {
      console.error('[v0] Send dialog: Error sending message:', error)
      alert('Error sending message: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-500'
      case 'pro':
        return 'bg-purple-500/20 text-purple-500'
      default:
        return 'bg-blue-500/20 text-blue-500'
    }
  }

  const getInitials = (name: string, email: string) => {
    if (name) return name.slice(0, 2).toUpperCase()
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a direct message to this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipient.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {getInitials(recipient.display_name || '', recipient.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {recipient.display_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">{recipient.email}</p>
            </div>
            <Badge className={getRoleColor(recipient.role || 'client')}>
              {(recipient.role || 'client').toUpperCase()}
            </Badge>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              className="resize-none h-24"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !message.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
