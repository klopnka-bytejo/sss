"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/contexts/cart-context"
import { 
  Search, 
  ShoppingCart,
  X
} from "lucide-react"

interface ServicesContentProps {
  services: any[]
  selectedCategory?: string
  search?: string
}

const categories = [
  "Coaching",
  "Consulting",
  "Design",
  "Development",
  "Marketing",
  "Writing",
]

export function ServicesContent({ 
  services, 
  selectedCategory,
  search: initialSearch
}: ServicesContentProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [searchQuery, setSearchQuery] = useState(initialSearch || "")

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const handleCategoryFilter = (category: string | null) => {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (searchQuery) params.set("search", searchQuery)
    router.push(`/services${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const params = new URLSearchParams()
    if (value) params.set("search", value)
    if (selectedCategory) params.set("category", selectedCategory)
    router.push(`/services${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const handleBuyNow = (service: any) => {
    addItem({
      serviceId: service.id,
      title: service.title,
      price_cents: service.price_cents,
      quantity: 1,
    })
    router.push("/checkout")
  }

  const clearFilters = () => {
    setSearchQuery("")
    router.push("/services")
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {selectedCategory ? selectedCategory : "All Services"}
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
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-input"
          />
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
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategory || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
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
                onClick={() => handleSearch("")}
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
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-all group overflow-hidden flex flex-col">
              <CardHeader className="pb-3">
                {service.category && (
                  <Badge variant="secondary" className="text-xs w-fit mb-2">
                    {service.category}
                  </Badge>
                )}
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatCurrency(service.price_cents || 0)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleBuyNow(service)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy Now
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/services/${service.id}`}>
                    Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No services found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {services.length === 0 
                ? "No services are available yet. Check back soon!"
                : "Try adjusting your filters to find what you're looking for."
              }
            </p>
            {(selectedCategory || searchQuery) && (
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
