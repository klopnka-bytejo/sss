'use client'

import { useEffect, useState } from 'react'
import { Star, Loader2, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

interface ReviewFilterProps {
  proId: string
  onReviewsChange?: (reviews: Review[]) => void
}

type SortOption = 'helpful' | 'recent' | 'highest' | 'lowest'
type FilterOption = 'all' | 1 | 2 | 3 | 4 | 5

export function ReviewFilter({ proId, onReviewsChange }: ReviewFilterProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterRating, setFilterRating] = useState<FilterOption>('all')

  useEffect(() => {
    fetchReviews()
  }, [proId])

  const fetchReviews = async () => {
    try {
      console.log('[v0] Review filter: Fetching reviews for pro:', proId)
      const res = await fetch(`/api/orders/review?proId=${proId}&pageSize=100`, { 
        credentials: 'include' 
      })

      if (res.ok) {
        const data = await res.json()
        console.log('[v0] Review filter: Fetched', data.reviews?.length, 'reviews')
        setReviews(data.reviews || [])
        onReviewsChange?.(data.reviews || [])
      }
    } catch (error) {
      console.error('[v0] Review filter: Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSortedReviews = () => {
    let sorted = [...reviews]

    // Apply rating filter
    if (filterRating !== 'all') {
      sorted = sorted.filter(r => r.rating === filterRating)
    }

    // Apply sorting
    switch (sortBy) {
      case 'helpful':
        sorted.sort((a, b) => b.helpful_count - a.helpful_count)
        break
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating)
        break
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return sorted
  }

  const sortedReviews = getSortedReviews()
  const ratingCount = filterRating === 'all' 
    ? reviews.length 
    : reviews.filter(r => r.rating === filterRating).length

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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-4 flex-wrap">
        <Select value={filterRating.toString()} onValueChange={(val) => setFilterRating(val as FilterOption)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews ({reviews.length})</SelectItem>
            {[5, 4, 3, 2, 1].map((star) => (
              <SelectItem key={star} value={star.toString()}>
                {star}★ ({reviews.filter(r => r.rating === star).length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">
              <Clock className="h-4 w-4 inline mr-2" />
              Most Recent
            </SelectItem>
            <SelectItem value="helpful">
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Most Helpful
            </SelectItem>
            <SelectItem value="highest">
              Highest Rating
            </SelectItem>
            <SelectItem value="lowest">
              Lowest Rating
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : sortedReviews.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No reviews matching your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedReviews.map((review) => (
            <Card key={review.id} className="hover:bg-accent transition">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.client_avatar || ''} />
                        <AvatarFallback>{review.client_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{review.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                  </div>

                  {/* Title */}
                  {review.title && (
                    <p className="font-semibold text-sm">{review.title}</p>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-foreground line-clamp-3">{review.comment}</p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Order {review.order_number}</span>
                    {review.helpful_count > 0 && (
                      <span>{review.helpful_count} found helpful</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
