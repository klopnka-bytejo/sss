import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClientHeader } from "@/components/client-header"
import { 
  Gamepad2, 
  ArrowRight,
  Search,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Shield,
  Clock,
  CheckCircle2,
  Star,
  Package,
  Users,
  Zap,
  RefreshCw,
  HeadphonesIcon
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <ClientHeader 
        title="How It Works"
        breadcrumbs={[{ label: 'How It Works', href: '/how-it-works' }]}
      />

      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 text-xs">
              <Shield className="h-3 w-3 mr-1" />
              100% Secure Process
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-gradient">Orders</span> Work
            </h1>
            <p className="text-muted-foreground">
              A simple, secure process from start to finish. Your payment is protected until you confirm completion.
            </p>
          </div>
        </div>
      </section>

      {/* Order Flow Steps */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    1
                  </div>
                  <div className="w-0.5 flex-1 bg-border/50 mt-2" />
                </div>
                <Card className="flex-1 glass border-border/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Browse & Choose</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Browse our marketplace of verified gaming services. Filter by game, category, or search for specific services.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Filter by Game</Badge>
                      <Badge variant="outline" className="text-xs">Compare Prices</Badge>
                      <Badge variant="outline" className="text-xs">Read Reviews</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    2
                  </div>
                  <div className="w-0.5 flex-1 bg-border/50 mt-2" />
                </div>
                <Card className="flex-1 glass border-border/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Customize Your Order</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select your options, add any extras, and provide the necessary details for your order.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Select rank/level
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Choose add-ons
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Set schedule
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Add instructions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    3
                  </div>
                  <div className="w-0.5 flex-1 bg-border/50 mt-2" />
                </div>
                <Card className="flex-1 glass border-border/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Secure Payment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pay securely with Stripe. Your payment is held in escrow until you confirm the order is complete.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">Payment Protected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">Money-back Guarantee</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    4
                  </div>
                  <div className="w-0.5 flex-1 bg-border/50 mt-2" />
                </div>
                <Card className="flex-1 glass border-border/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">PRO Accepts</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      A verified PRO accepts your order. You can view their profile, ratings, and past reviews.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <span className="text-sm text-muted-foreground">All PROs are verified</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    5
                  </div>
                  <div className="w-0.5 flex-1 bg-border/50 mt-2" />
                </div>
                <Card className="flex-1 glass border-border/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Track & Communicate</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track your order progress in real-time. Chat directly with your PRO for updates and coordination.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        Real-time status
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Direct chat
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 text-primary" />
                        Progress updates
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HeadphonesIcon className="h-4 w-4 text-primary" />
                        24/7 Support
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step 6 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center text-success-foreground font-bold">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
                <Card className="flex-1 glass border-success/30 bg-success/5">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/20">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <CardTitle className="text-lg">Complete & Review</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Confirm the order is complete. Leave a review for your PRO. Payment is released from escrow.
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span className="text-sm text-muted-foreground">Your feedback helps others find great PROs</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Status Types */}
      <section className="py-12 bg-card/30 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center">Order Status Types</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
                <Badge className="bg-warning/20 text-warning border-warning/30 mb-2">Pending</Badge>
                <p className="text-xs text-muted-foreground">Waiting for a PRO to accept</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
                <Badge className="bg-info/20 text-info border-info/30 mb-2">In Progress</Badge>
                <p className="text-xs text-muted-foreground">PRO is working on your order</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
                <Badge className="bg-accent/20 text-accent border-accent/30 mb-2">Delivered</Badge>
                <p className="text-xs text-muted-foreground">PRO completed, awaiting confirmation</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
                <Badge className="bg-success/20 text-success border-success/30 mb-2">Completed</Badge>
                <p className="text-xs text-muted-foreground">Order finished successfully</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center">Common Questions</h2>
            <div className="space-y-4">
              <Card className="glass border-border/30">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">Is my payment safe?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. Payments are processed through Stripe and held in escrow until you confirm the order is complete.
                  </p>
                </CardContent>
              </Card>
              <Card className="glass border-border/30">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">What if I&apos;m not satisfied?</h3>
                  <p className="text-sm text-muted-foreground">
                    You can open a dispute and our support team will review the case. We offer a money-back guarantee.
                  </p>
                </CardContent>
              </Card>
              <Card className="glass border-border/30">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">How long do orders take?</h3>
                  <p className="text-sm text-muted-foreground">
                    It varies by service. Most boosting orders complete within 1-3 days. Coaching sessions are scheduled at your convenience.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-6">
              <Button variant="outline" asChild>
                <Link href="/faq">
                  View All FAQ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Create a free account and browse our marketplace of verified gaming services.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="gradient-primary border-0" asChild>
                <Link href="/auth/register">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/browse-services">Browse Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Elevate Gaming. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
