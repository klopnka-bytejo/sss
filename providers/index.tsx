'use client'

import { CartProvider } from '@/lib/contexts/cart-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}
