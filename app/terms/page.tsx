import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="container max-w-4xl py-12">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: April 2026</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using Elevate Gaming (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              Elevate Gaming is a marketplace platform that connects clients seeking gaming services with professional gamers (&quot;PROs&quot;) who provide those services. We facilitate transactions but do not directly provide gaming services.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Payments and Fees</h2>
            <p className="text-muted-foreground mb-4">
              All payments are processed securely through our payment partners. Funds are held in escrow until service completion. PROs receive 85% of the order total after the 24-hour review period.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Service Delivery</h2>
            <p className="text-muted-foreground mb-4">
              PROs are independent contractors and are solely responsible for the quality and delivery of their services. Elevate Gaming does not guarantee specific outcomes or results.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Prohibited Activities</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>Sharing contact information to circumvent the platform</li>
              <li>Fraudulent or deceptive practices</li>
              <li>Harassment or abuse of other users</li>
              <li>Violating game publisher terms of service</li>
              <li>Money laundering or illegal transactions</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Account Termination</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse our platform.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              Elevate Gaming is not liable for any damages arising from the use of our service, including but not limited to account bans by game publishers or loss of in-game progress.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these terms, please contact us at legal@elevategaming.com
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
