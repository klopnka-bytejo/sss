import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCart } from '@/lib/contexts/cart-context'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface ServiceCardProps {
  id: string
  title: string
  description?: string
  price_cents: number
  category?: string
}

export function ServiceCard({
  id,
  title,
  description,
  price_cents,
  category,
}: ServiceCardProps) {
  const { addItem } = useCart()

  const handleBuyNow = () => {
    addItem({
      serviceId: id,
      title,
      price_cents,
      quantity: 1,
    })
    // Redirect to checkout
    window.location.href = '/checkout'
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{title}</CardTitle>
            {category && (
              <CardDescription className="mt-1 text-xs">{category}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        
        <div className="mt-auto space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatPrice(price_cents)}</span>
          </div>

          <Button
            onClick={handleBuyNow}
            className="w-full gradient-primary"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy Now
          </Button>

          <Button
            variant="outline"
            className="w-full"
            size="sm"
            asChild
          >
            <Link href={`/services/${id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
