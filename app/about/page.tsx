import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Gamepad2, 
  Target, 
  Eye, 
  GraduationCap, 
  Shield, 
  Users, 
  Zap,
  ArrowLeft,
  Globe
} from "lucide-react"

export const metadata = {
  title: "About Us | Elevate Gaming",
  description: "Learn about Elevate Gaming - a premium gaming services marketplace",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Elevate Gaming</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl gradient-primary">
              <Gamepad2 className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-primary">Elevate Gaming</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Elevate Gaming is a premium gaming services marketplace developed as an academic project 
            by students from Jordan, studying Computer Science at the University of Jordan.
          </p>
        </div>

        {/* Description Card */}
        <Card className="glass max-w-4xl mx-auto mb-12">
          <CardContent className="p-8">
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              The platform is designed to connect players with professional gamers (PROs) for services 
              such as boosting, coaching, and account improvement through a secure, transparent, and 
              user-friendly system. Our goal is to create a trusted marketplace where gamers can find 
              reliable services while professionals can showcase their skills and earn.
            </p>
          </CardContent>
        </Card>

        {/* Mission, Vision, Academic Context */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To provide a secure and trusted marketplace for professional gaming services, 
                ensuring both clients and service providers have a seamless and protected experience.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Our Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To demonstrate how modern web platforms can improve digital gaming services 
                using structured workflows, role-based access, and industry best practices.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Academic Context</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This platform was developed as part of a university graduation project focusing 
                on system design, UI/UX, and software engineering principles.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Platform Features</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/30 border border-border/50">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Protected payments with escrow system and buyer protection
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/30 border border-border/50">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Verified PROs</h3>
                <p className="text-sm text-muted-foreground">
                  All service providers are verified and rated by clients
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/30 border border-border/50">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Quick turnaround times with real-time order tracking
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/30 border border-border/50">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Globe className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Multi-Game Support</h3>
                <p className="text-sm text-muted-foreground">
                  Services available for popular games across all platforms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <Card className="glass p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Join Elevate Gaming today and experience the best gaming services marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Services
                </Button>
              </Link>
              <Link href="/become-pro">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Become a PRO
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Elevate Gaming. University of Jordan - Academic Project.
          </p>
        </div>
      </footer>
    </div>
  )
}
