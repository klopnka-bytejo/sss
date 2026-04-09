'use client'

import { useCart } from '@/lib/contexts/cart-context'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CartButton() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <Button variant="ghost" size="sm" asChild className="relative">
      <Link href="/checkout">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
