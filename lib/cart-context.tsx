'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useSWR from 'swr'

interface CartContextType {
  itemCount: number
  isLoading: boolean
  addToCart: (serviceId: string) => Promise<boolean>
  removeFromCart: (itemId: string) => Promise<boolean>
  refetch: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch cart')
  return res.json()
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  
  // Get user ID from cookie on mount
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
    }
    setUserId(getCookie('user_id') || null)
  }, [])

  const { data, isLoading, error, mutate } = useSWR(
    userId ? `/api/cart?user_id=${userId}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const itemCount = data?.itemCount || 0

  const addToCart = async (serviceId: string) => {
    if (!userId) return false
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          selected_options: {},
          calculated_price_cents: 0,
          requirements: {}
        })
      })
      if (res.ok) {
        mutate()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to add to cart:', error)
      return false
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!userId) return false
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        mutate()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      return false
    }
  }

  return (
    <CartContext.Provider value={{ itemCount, isLoading, addToCart, removeFromCart, refetch: mutate }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
