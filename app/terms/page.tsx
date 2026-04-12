import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Terms of Service
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
                <div>
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Elevate Gaming (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Elevate Gaming is a marketplace platform that connects clients seeking gaming services with professional gamers (&quot;PROs&quot;) who provide those services. We facilitate transactions but do not directly provide gaming services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">4. Payments and Fees</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All payments are processed securely through our payment partners. Funds are held in escrow until service completion. PROs receive 85% of the order total after the 24-hour review period.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">5. Service Delivery</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    PROs are independent contractors and are solely responsible for the quality and delivery of their services. Elevate Gaming does not guarantee specific outcomes or results.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 leading-relaxed">
                    <li>Sharing contact information to circumvent the platform</li>
                    <li>Fraudulent or deceptive practices</li>
                    <li>Harassment or abuse of other users</li>
                    <li>Violating game publisher terms of service</li>
                    <li>Money laundering or illegal transactions</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">7. Account Termination</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse our platform.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Elevate Gaming is not liable for any damages arising from the use of our service, including but not limited to account bans by game publishers or loss of in-game progress.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these terms, please contact us at legal@elevategaming.com
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
                  <Link href="/support">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
