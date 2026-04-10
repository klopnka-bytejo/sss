'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star, Loader2 } from 'lucide-react'

interface PRO {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  country: string
  bio: string
  rating: number
  total_orders: number
  completion_rate: number
  games: string | null
}

interface AssignPRODialogProps {
  orderId: string
  onAssign: (proId: string) => Promise<void>
}

export function AssignPRODialog({ orderId, onAssign }: AssignPRODialogProps) {
  const [open, setOpen] = useState(false)
  const [pros, setPros] = useState<PRO[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)

  const handleOpenDialog = async () => {
    if (pros.length === 0) {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/pros')
        if (response.ok) {
          const data = await response.json()
          setPros(data.pros || [])
        }
      } catch (error) {
        console.error('[v0] Error fetching PROs:', error)
      } finally {
        setLoading(false)
      }
    }
    setOpen(true)
  }

  const handleAssignPRO = async (proId: string) => {
    setAssigning(proId)
    try {
      await onAssign(proId)
      setOpen(false)
    } finally {
      setAssigning(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleOpenDialog} size="sm" className="bg-blue-600 hover:bg-blue-700">
          Assign PRO
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign PRO to Order</DialogTitle>
          <DialogDescription>Select a PRO to assign to this order based on their rating and experience</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-4">
              {pros.map((pro) => (
                <div
                  key={pro.id}
                  className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={pro.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {pro.display_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{pro.display_name}</p>
                        {pro.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{pro.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{pro.email}</p>
                      {pro.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{pro.bio}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {pro.country && <Badge variant="outline" className="text-xs">{pro.country}</Badge>}
                        <Badge variant="outline" className="text-xs">{pro.total_orders || 0} Orders</Badge>
                        {pro.completion_rate !== undefined && (
                          <Badge variant="outline" className="text-xs">{pro.completion_rate}%</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAssignPRO(pro.id)}
                    disabled={assigning !== null}
                    size="sm"
                    className="ml-4 flex-shrink-0"
                  >
                    {assigning === pro.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
