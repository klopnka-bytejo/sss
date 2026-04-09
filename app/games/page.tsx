import { sql } from "@/lib/neon/server"
import { AppLayout } from "@/components/app-layout"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Gamepad2 } from "lucide-react"

export default async function GamesPage() {
  // Redirect to services page since there's no games table in this implementation
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Gamepad2 className="h-3 w-3 mr-1" />
                Browse Services
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Professional Services
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Browse our marketplace for expert coaching, consulting, and professional services
              </p>
              <Link href="/services">
                <Card className="inline-block group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3">
                      <Gamepad2 className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <h3 className="text-xl font-bold">View All Services</h3>
                        <p className="text-sm text-muted-foreground">
                          Explore our marketplace
                        </p>
                      </div>
                      <ArrowRight className="h-6 w-6 ml-4 transition-transform group-hover:translate-x-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
