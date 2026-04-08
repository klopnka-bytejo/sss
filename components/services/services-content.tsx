"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Trophy, 
  Users, 
  Zap,
  ShoppingCart,
  Gamepad2,
  X
} from "lucide-react"
import type { Service, Profile, ServiceCategory, Game } from "@/lib/types"

interface ServicesContentProps {
  services: Service[]
  games: Game[]
  user: Profile | null
  selectedGame?: string
  selectedCategory?: string
}

const categoryIcons: Record<ServiceCategory, typeof Trophy> = {
  boosting: Trophy,
  coaching: Users,
  account: Zap,
}

const categoryLabels: Record<ServiceCategory, string> = {
  boosting: "Boosting",
  coaching: "Coaching",
  account: "Account",
}

const categories: ServiceCategory[] = ["boosting", "coaching", "account"]

export function ServicesContent({ 
  services, 
  games, 
  user, 
  selectedGame,
  selectedCategory 
}: ServicesContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const handleGameFilter = (gameSlug: string | null) => {
    const params = new URLSearchParams()
    if (gameSlug) params.set("game", gameSlug)
    if (selectedCategory) params.set("category", selectedCategory)
    router.push(`/services${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const handleCategoryFilter = (category: string | null) => {
    const params = new URLSearchParams()
    if (selectedGame) params.set("game", selectedGame)
    if (category) params.set("category", category)
    router.push(`/services${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    router.push("/services")
  }

  const activeGame = games.find(g => g.slug === selectedGame)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {activeGame ? activeGame.name : "All Services"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredServices.length} services available
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input"
          />
        </div>
      </div>

      {/* Games Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Filter by Game</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedGame ? "default" : "outline"}
            size="sm"
            onClick={() => handleGameFilter(null)}
            className="h-auto py-2"
          >
            All Games
          </Button>
          {games.map((game) => (
            <Button
              key={game.id}
              variant={selectedGame === game.slug ? "default" : "outline"}
              size="sm"
              onClick={() => handleGameFilter(game.slug)}
              className="h-auto py-2 gap-2"
            >
              {game.logo_url ? (
                <Image
                  src={game.logo_url}
                  alt={game.name}
                  width={20}
                  height={20}
                  className="rounded"
                />
              ) : (
                <Gamepad2 className="h-4 w-4" />
              )}
              {game.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryFilter(null)}
          >
            All Categories
          </Button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat]
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilter(cat)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {categoryLabels[cat]}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Active Filters */}
      {(selectedGame || selectedCategory || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedGame && activeGame && (
            <Badge variant="secondary" className="gap-1">
              {activeGame.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleGameFilter(null)}
              />
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {selectedCategory}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleCategoryFilter(null)}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              &quot;{searchQuery}&quot;
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchQuery("")}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const CategoryIcon = categoryIcons[service.category]
            return (
              <Card key={service.id} className="glass hover:glow-primary transition-all group overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {categoryLabels[service.category]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {service.game}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors mt-2">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gradient">
                      {formatCurrency(service.price_cents)}
                    </span>
                    {service.price_type === "hourly" && (
                      <span className="text-sm text-muted-foreground">/hr</span>
                    )}
                    {service.price_type === "per_rank" && (
                      <span className="text-sm text-muted-foreground">/rank</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button className="w-full" asChild>
                    <Link href={`/services/${service.id}`}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No services found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {services.length === 0 
                ? "No services are available yet. Check back soon!"
                : "Try adjusting your filters to find what you're looking for."
              }
            </p>
            {(selectedCategory || selectedGame || searchQuery) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
