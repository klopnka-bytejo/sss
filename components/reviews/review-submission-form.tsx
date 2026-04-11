'use client'

import { useState } from 'react'
import { Star, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ReviewSubmissionFormProps {
  orderId: string
  proName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReviewSubmissionForm({
  orderId,
  proName,
  open,
  onOpenChange,
  onSuccess
}: ReviewSubmissionFormProps) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('[v0] Review form: Submitting review with rating:', rating)

    try {
      const response = await fetch('/api/orders/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Review form: Review submitted successfully:', data.reviewId)
        setSuccess(true)
        setTimeout(() => {
          setRating(5)
          setTitle('')
          setComment('')
          setSuccess(false)
          onOpenChange(false)
          onSuccess?.()
        }, 1500)
      } else {
        const errorData = await response.json()
        console.error('[v0] Review form: API error:', errorData)
        setError(errorData.error || 'Failed to submit review')
      }
    } catch (err) {
      console.error('[v0] Review form: Error:', err)
      setError('Error submitting review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>Share your experience with {proName}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Thank you for your review!</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Your review helps other gamers find great services.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 5 && 'Excellent! Will definitely order again'}
                {rating === 4 && 'Great! Very happy with the service'}
                {rating === 3 && 'Good, met my expectations'}
                {rating === 2 && 'Fair, but some issues'}
                {rating === 1 && 'Poor, not satisfied'}
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Review Title (Optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Great boost, fast delivery!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">{title.length}/255</p>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Review Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share more details about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={5}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">{comment.length}/1000</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Helpful Info */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> Detailed reviews help other gamers make better decisions and help PROs improve their services.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
