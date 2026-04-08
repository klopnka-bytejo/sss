import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <AppLayout>
      <div className="container max-w-4xl py-12">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-3xl">Refund Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: April 2026</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Buyer Protection Guarantee
              </h3>
              <p className="text-muted-foreground text-sm">
                Your payment is protected. Funds are held in escrow until the service is completed to your satisfaction.
              </p>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-3">Full Refund Eligibility</h2>
            <p className="text-muted-foreground mb-4">You are eligible for a full refund if:</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>The order has not been accepted by a PRO yet</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>The PRO fails to start work within the agreed timeframe</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>The PRO is unable to complete the service as described</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Technical issues on our end prevent service delivery</span>
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">Partial Refund Cases</h2>
            <p className="text-muted-foreground mb-4">Partial refunds may be issued when:</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                <span>Work has started but cannot be completed due to account issues</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                <span>Partial completion of the service before cancellation</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                <span>Mutual agreement between client and PRO</span>
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">Non-Refundable Situations</h2>
            <p className="text-muted-foreground mb-4">Refunds will not be issued for:</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-muted-foreground">
                <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                <span>Completed orders after the 24-hour review period</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                <span>Account bans or suspensions by game publishers</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                <span>Client-caused delays or non-cooperation</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                <span>Change of mind after work has significantly progressed</span>
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">How to Request a Refund</h2>
            <ol className="list-decimal pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Go to your Orders page and select the order</li>
              <li>Click &quot;Request Refund&quot; or &quot;Dispute Order&quot;</li>
              <li>Provide a reason and any supporting evidence</li>
              <li>Our team will review within 24-48 hours</li>
              <li>Approved refunds are processed within 5-7 business days</li>
            </ol>

            <h2 className="text-xl font-semibold mt-6 mb-3">Dispute Resolution</h2>
            <p className="text-muted-foreground mb-4">
              If you and the PRO cannot reach an agreement, our support team will mediate. We review all evidence and make a fair decision based on our policies.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Refund Processing Time</h2>
            <div className="grid gap-2 mb-6">
              <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Credit/Debit Card</span>
                <Badge variant="outline">5-7 business days</Badge>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">PayPal</span>
                <Badge variant="outline">1-3 business days</Badge>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Cryptocurrency</span>
                <Badge variant="outline">1-2 business days</Badge>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Wallet Credit</span>
                <Badge variant="outline">Instant</Badge>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-3">Contact Support</h2>
            <p className="text-muted-foreground mb-4">
              For refund inquiries, contact our support team at support@elevategaming.com or use the in-app chat.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
