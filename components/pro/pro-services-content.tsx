"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  MoreVertical,
  Edit,
  Trash2,
  Trophy,
  Users,
  Zap,
  Eye,
  EyeOff,
  Briefcase
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Service, Profile, ServiceCategory } from "@/lib/types"

interface ProServicesContentProps {
  services: Service[]
  user: Profile
}

const categoryIcons: Record<ServiceCategory, typeof Trophy> = {
  boosting: Trophy,
  coaching: Users,
  account: Zap,
}

const categoryLabels: Record<ServiceCategory, string> = {
  boosting: "Rank Boosting",
  coaching: "Coaching",
  account: "Account Services",
}

export function ProServicesContent({ services: initialServices, user }: ProServicesContentProps) {
  const router = useRouter()
  const [services, setServices] = useState(initialServices)

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("services")
      .update({ is_active: !currentStatus })
      .eq("id", serviceId)

    if (!error) {
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, is_active: !currentStatus } : s
      ))
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    const supabase = createClient()
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)

    if (!error) {
      setServices(services.filter(s => s.id !== serviceId))
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Services</h1>
          <p className="text-muted-foreground mt-1">
            Manage your service offerings
          </p>
        </div>
        <Button asChild>
          <Link href="/pro/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Service
          </Link>
        </Button>
      </div>

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const CategoryIcon = categoryIcons[service.category]
            return (
              <Card key={service.id} className={`glass transition-all ${!service.is_active ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="mb-2">
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {categoryLabels[service.category]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/pro/services/${service.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(service.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{service.game}</Badge>
                    <div className="flex items-center gap-2">
                      {service.is_active ? (
                        <Eye className="h-4 w-4 text-success" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => handleToggleActive(service.id, service.is_active)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gradient">
                      {formatCurrency(service.price_cents)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {service.price_type === "hourly" ? "/hr" : service.price_type === "per_rank" ? "/rank" : "fixed"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  {service.is_active ? "Visible to clients" : "Hidden from marketplace"}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No services yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first service to start receiving orders
            </p>
            <Button asChild>
              <Link href="/pro/services/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Service
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
