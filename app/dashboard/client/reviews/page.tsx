'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Loader2, MessageSquare } from 'lucide-react'

interface ClientReview {
  id: string
  rating: number
  title: string | null
  comment: string | null
  created_at: string
  order_id: string
  order_number: string
  pro_name: string
  pro_avatar: string | null
  service_title: string
}

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState<ClientReview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all')

  useEffect(() => {
    fetchClientReviews()
  }, [])

  const fetchClientReviews = async () => {
    try {
      console.log('[v0] Client reviews page: Fetching reviews')
      const res = await fetch('/api/client/reviews', { credentials: 'include' })

      if (res.ok) {
        const data = await res.json()
        console.log('[v0] Client reviews page: Fetched', data.reviews?.length, 'reviews')
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('[v0] Client reviews page: Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === filter)

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${iconSize} ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AppLayout breadcrumbs={[{ label: 'My Reviews' }]} userRole="client">
      <div className="space-y-6">
        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Review Summary</CardTitle>
            <CardDescription>See your rating history and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Average Rating Given</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold">{averageRating}</div>
                  <div className="flex gap-0.5">{renderStars(Math.round(parseFloat(averageRating as string)))}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">from {reviews.length} reviews</p>
              </div>

              {/* Rating Distribution */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Distribution</p>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-4">{star}★</span>
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{
                            width: `${reviews.length > 0 ? (ratingDistribution[star as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-6 text-right">
                        {ratingDistribution[star as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={filter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            All ({reviews.length})
          </Badge>
          {[5, 4, 3, 2, 1].map((star) => (
            <Badge
              key={star}
              variant={filter === star ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter(star as any)}
            >
              {star}★ ({ratingDistribution[star as keyof typeof ratingDistribution]})
            </Badge>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground text-center">
                {filter === 'all'
                  ? 'You haven\'t written any reviews yet'
                  : `No ${filter}★ reviews`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.pro_avatar || ''} />
                          <AvatarFallback>{review.pro_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{review.pro_name}</p>
                          <p className="text-sm text-muted-foreground">{review.service_title}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">{renderStars(review.rating, 'md')}</div>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <p className="font-semibold text-sm">{review.title}</p>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-foreground">{review.comment}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Order {review.order_number}</span>
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
