'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Trash2, Eye, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Star } from 'lucide-react'

interface ReviewItem {
  id: string
  rating: number
  title: string | null
  comment: string | null
  client_name: string
  client_avatar: string | null
  pro_name: string
  pro_avatar: string | null
  created_at: string
  moderation_status: string
  is_flagged: boolean
  flag_reason: string | null
  order_number: string
}

export default function AdminReviewModerationPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'flagged'>('pending')
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      console.log('[v0] Admin reviews: Fetching reviews for moderation')
      const res = await fetch('/api/admin/reviews', { credentials: 'include' })

      if (res.ok) {
        const data = await res.json()
        console.log('[v0] Admin reviews: Fetched', data.reviews?.length, 'reviews')
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('[v0] Admin reviews: Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    setActionLoading(true)
    try {
      console.log('[v0] Admin reviews: Approving review:', reviewId)
      const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
        credentials: 'include',
      })

      if (res.ok) {
        console.log('[v0] Admin reviews: Review approved')
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, moderation_status: 'approved' } : r
        ))
        setSelectedReview(null)
      }
    } catch (error) {
      console.error('[v0] Admin reviews: Error approving:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedReview) return
    setActionLoading(true)
    try {
      console.log('[v0] Admin reviews: Rejecting review:', selectedReview.id)
      const res = await fetch(`/api/admin/reviews/${selectedReview.id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })

      if (res.ok) {
        console.log('[v0] Admin reviews: Review rejected')
        setReviews(reviews.map(r => 
          r.id === selectedReview.id ? { ...r, moderation_status: 'rejected' } : r
        ))
        setSelectedReview(null)
        setShowRejectDialog(false)
        setRejectReason('')
      }
    } catch (error) {
      console.error('[v0] Admin reviews: Error rejecting:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getFilteredReviews = () => {
    if (filterStatus === 'all') return reviews
    if (filterStatus === 'flagged') return reviews.filter(r => r.is_flagged)
    return reviews.filter(r => r.moderation_status === filterStatus)
  }

  const filteredReviews = getFilteredReviews()
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.moderation_status === 'pending').length,
    approved: reviews.filter(r => r.moderation_status === 'approved').length,
    rejected: reviews.filter(r => r.moderation_status === 'rejected').length,
    flagged: reviews.filter(r => r.is_flagged).length,
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ))
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <AppLayout breadcrumbs={[{ label: 'Admin' }, { label: 'Review Moderation' }]} userRole="admin">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Pending', value: stats.pending, highlight: true },
            { label: 'Approved', value: stats.approved },
            { label: 'Rejected', value: stats.rejected },
            { label: 'Flagged', value: stats.flagged },
          ].map((stat) => (
            <Card key={stat.label} className={stat.highlight ? 'border-yellow-300 bg-yellow-50' : ''}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={filterStatus} onValueChange={(val) => setFilterStatus(val as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({stats.rejected})
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged ({stats.flagged})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filterStatus} className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">No reviews to display</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className={review.is_flagged ? 'border-red-300 bg-red-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-semibold text-sm">
                                  {review.client_name} → {review.pro_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Order {review.order_number}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                              <Badge variant={getStatusBadgeVariant(review.moderation_status)}>
                                {review.moderation_status}
                              </Badge>
                              {review.is_flagged && (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Title and Comment */}
                        {review.title && (
                          <p className="font-semibold text-sm">{review.title}</p>
                        )}
                        {review.comment && (
                          <p className="text-sm text-foreground">{review.comment}</p>
                        )}

                        {/* Flag Reason */}
                        {review.is_flagged && review.flag_reason && (
                          <div className="p-3 rounded-lg bg-red-100 border border-red-200">
                            <p className="text-sm text-red-900">
                              <strong>Flag Reason:</strong> {review.flag_reason}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {review.moderation_status === 'pending' && (
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(review.id)}
                              disabled={actionLoading}
                              className="gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedReview(review)
                                setShowRejectDialog(true)
                              }}
                              disabled={actionLoading}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="gap-2 ml-auto"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Rejection Reason (optional)</label>
            <textarea
              className="w-full p-2 border rounded-lg text-sm"
              placeholder="Why are you rejecting this review?"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Review'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
