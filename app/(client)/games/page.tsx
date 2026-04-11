'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, AlertCircle } from 'lucide-react'

interface Game {
  id: string
  name: string
  slug: string
  description: string
  logo_url?: string
  banner_url?: string
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games')
      if (!response.ok) throw new Error('Failed to fetch games')
      const data = await response.json()
      setGames(data.games || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching games')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (game: Game) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === game.id && item.type === 'game')
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: game.id,
        type: 'game',
        name: game.name,
        price: 19.99,
        quantity: 1,
        logo_url: game.logo_url
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    alert(`${game.name} added to cart!`)
  }

  if (loading) return <div className="p-8 text-center">Loading games...</div>
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Games</h1>
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

        {games.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No games available at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {game.banner_url && (
                  <div className="h-40 bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden">
                    <img src={game.banner_url} alt={game.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{game.name}</CardTitle>
                  {game.description && <CardDescription>{game.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => addToCart(game)}
                    className="w-full"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart - $19.99
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
