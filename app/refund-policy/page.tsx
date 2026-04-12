import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Refund Policy
              </h1>
              <p className="text-muted-foreground">Last updated: April 2026</p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <Card className="glass">
              <CardContent className="p-8 space-y-8">
                {/* Buyer Protection Guarantee */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Buyer Protection Guarantee
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Your payment is protected. Funds are held in escrow until the service is completed to your satisfaction.
                  </p>
                </div>

                {/* Full Refund Eligibility */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Full Refund Eligibility</h2>
                  <p className="text-muted-foreground mb-4">You are eligible for a full refund if:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>The order has not been accepted by a PRO yet</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>The PRO fails to start work within the agreed timeframe</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>The PRO is unable to complete the service as described</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Technical issues on our end prevent service delivery</span>
                    </li>
                  </ul>
                </div>

                {/* Partial Refund Cases */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Partial Refund Cases</h2>
                  <p className="text-muted-foreground mb-4">Partial refunds may be issued when:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>Work has started but cannot be completed due to account issues</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>Partial completion of the service before cancellation</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>Mutual agreement between client and PRO</span>
                    </li>
                  </ul>
                </div>

                {/* Non-Refundable Situations */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Non-Refundable Situations</h2>
                  <p className="text-muted-foreground mb-4">Refunds will not be issued for:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Completed orders after the 24-hour review period</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Account bans or suspensions by game publishers</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Client-caused delays or non-cooperation</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Change of mind after work has significantly progressed</span>
                    </li>
                  </ul>
                </div>

                {/* How to Request a Refund */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">How to Request a Refund</h2>
                  <ol className="space-y-3">
                    <li className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold flex-shrink-0 w-6">1.</span>
                      <span>Go to your Orders page and select the order</span>
                    </li>
                    <li className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold flex-shrink-0 w-6">2.</span>
                      <span>Click &quot;Request Refund&quot; or &quot;Dispute Order&quot;</span>
                    </li>
                    <li className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold flex-shrink-0 w-6">3.</span>
                      <span>Provide a reason and any supporting evidence</span>
                    </li>
                    <li className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold flex-shrink-0 w-6">4.</span>
                      <span>Our team will review within 24-48 hours</span>
                    </li>
                    <li className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold flex-shrink-0 w-6">5.</span>
                      <span>Approved refunds are processed within 5-7 business days</span>
                    </li>
                  </ol>
                </div>

                {/* Dispute Resolution */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you and the PRO cannot reach an agreement, our support team will mediate. We review all evidence and make a fair decision based on our policies.
                  </p>
                </div>

                {/* Refund Processing Time */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Refund Processing Time</h2>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Credit/Debit Card</span>
                      <Badge variant="outline">5-7 business days</Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">PayPal</span>
                      <Badge variant="outline">1-3 business days</Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Cryptocurrency</span>
                      <Badge variant="outline">1-2 business days</Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Wallet Credit</span>
                      <Badge variant="outline">Instant</Badge>
                    </div>
                  </div>
                </div>

                {/* Contact Support */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For refund inquiries, contact our support team at support@elevategaming.com or use the in-app chat.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="mt-12 glass border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Need Help?</h2>
                <p className="text-muted-foreground mb-6">
                  If you have any questions, feel free to contact us.
                </p>
                <Button asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
