'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, AlertCircle, User } from 'lucide-react'

interface Service {
  id: string
  title: string
  description?: string
  price_cents: number
  category?: string
  provider_name?: string
  provider_avatar?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services/public')
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching services')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (service: Service) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === service.id && item.type === 'service')
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: service.id,
        type: 'service',
        name: service.title,
        price: service.price_cents / 100,
        quantity: 1,
        category: service.category
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    alert(`${service.title} added to cart!`)
  }

  if (loading) return <div className="p-8 text-center">Loading services...</div>
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Services</h1>
          <Link href="/cart">
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {services.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No services available at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{service.title}</CardTitle>
                  {service.category && <CardDescription>{service.category}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                  )}
                  
                  {service.provider_name && (
                    <div className="flex items-center gap-2 text-sm">
                      {service.provider_avatar ? (
                        <img src={service.provider_avatar} alt={service.provider_name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">{service.provider_name}</span>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => addToCart(service)}
                    className="w-full"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart - ${(service.price_cents / 100).toFixed(2)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
