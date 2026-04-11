'use client'

import { useEffect, useState } from 'react'
import { Star, Loader2, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  created_at: string
  helpful_count: number
  unhelpful_count: number
  client_name: string
  client_avatar: string | null
  order_number: string
}

interface ReviewsDisplayProps {
  proId: string
  averageRating?: number
  totalReviews?: number
}

export function ReviewsDisplay({ proId, averageRating, totalReviews }: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 5

  useEffect(() => {
    fetchReviews()
  }, [proId])

  const fetchReviews = async (pageNum = 1) => {
    try {
      console.log('[v0] Reviews display: Fetching reviews for pro:', proId, 'page:', pageNum)
      const res = await fetch(
        `/api/orders/review?proId=${proId}&page=${pageNum}&pageSize=${pageSize}`,
        { credentials: 'include' }
      )

      if (res.ok) {
        const data = await res.json()
        console.log('[v0] Reviews display: Fetched', data.reviews?.length, 'reviews')
        setReviews(pageNum === 1 ? data.reviews : [...reviews, ...data.reviews])
        setHasMore(pageNum < data.pagination.totalPages)
      }
    } catch (error) {
      console.error('[v0] Reviews display: Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchReviews(nextPage)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reviews & Ratings</CardTitle>
            <CardDescription>
              {totalReviews && totalReviews > 0 ? `${totalReviews} reviews` : 'No reviews yet'}
            </CardDescription>
          </div>
          {averageRating !== undefined && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="flex gap-0.5 justify-end">{renderStars(Math.round(averageRating))}</div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No reviews yet. Be the first to review this PRO!</p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <div key={review.id} className="space-y-3 pb-6 border-b last:border-b-0">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.client_avatar || ''} />
                      <AvatarFallback>{review.client_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{review.client_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                </div>

                {/* Title */}
                {review.title && (
                  <div>
                    <p className="font-semibold text-sm">{review.title}</p>
                  </div>
                )}

                {/* Comment */}
                {review.comment && (
                  <div>
                    <p className="text-sm text-foreground">{review.comment}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Order: {review.order_number}
                  </div>
                  {review.helpful_count > 0 || review.unhelpful_count > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      {review.helpful_count} people found this helpful
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Reviews'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
