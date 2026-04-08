import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Mail, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md glass relative z-10 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-success/20">
              <Mail className="h-10 w-10 text-success" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We&apos;ve sent you a confirmation link to verify your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>Click the link in your email to activate your account and start using Elevate Gaming.</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Gamepad2 className="h-4 w-4" />
            <span>Welcome to the Elevate Gaming community!</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
