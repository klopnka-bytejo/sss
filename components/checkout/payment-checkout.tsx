"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Wallet, 
  Bitcoin, 
  CheckCircle, 
  Loader2,
  Shield,
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"

type PaymentMethod = "stripe" | "paypal" | "crypto"

interface PaymentCheckoutProps {
  serviceId: string
  serviceName: string
  priceInCents: number
  proId: string | null
  requirements?: Record<string, unknown>
}

export function PaymentCheckout({ 
  serviceId, 
  serviceName, 
  priceInCents,
  proId,
  requirements 
}: PaymentCheckoutProps) {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe")
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutState, setCheckoutState] = useState<"select" | "form" | "processing" | "success">("select")
  const [orderInfo, setOrderInfo] = useState<{ orderId: string; orderNumber: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fake card form state
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [email, setEmail] = useState("")

  // PayPal form state
  const [paypalEmail, setPaypalEmail] = useState("")

  // Crypto form state
  const [cryptoWallet, setCryptoWallet] = useState("")

  const paymentMethods = [
    {
      id: "stripe" as const,
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Pay securely with Visa, Mastercard, or AMEX",
      badge: "Most Popular",
    },
    {
      id: "paypal" as const,
      name: "PayPal",
      icon: Wallet,
      description: "Pay with your PayPal balance or linked accounts",
      badge: null,
    },
    {
      id: "crypto" as const,
      name: "Cryptocurrency",
      icon: Bitcoin,
      description: "Pay with Bitcoin, Ethereum, or USDT",
      badge: "5% Bonus",
    },
  ]

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(" ").slice(0, 19) : ""
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleProceedToPayment = () => {
    setCheckoutState("form")
  }

  const handleProcessPayment = async () => {
    setIsProcessing(true)
    setError(null)
    setCheckoutState("processing")

    try {
      const response = await fetch("/api/checkout/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          proId,
          paymentMethod: selectedMethod,
          requirements,
          // Fake payment details (test mode)
          paymentDetails: {
            email: selectedMethod === "stripe" ? email : selectedMethod === "paypal" ? paypalEmail : undefined,
            cardLast4: selectedMethod === "stripe" ? cardNumber.slice(-4) : undefined,
            walletAddress: selectedMethod === "crypto" ? cryptoWallet : undefined,
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment failed")
      }

      setOrderInfo({ orderId: data.orderId, orderNumber: data.orderNumber })
      setCheckoutState("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
      setCheckoutState("form")
    } finally {
      setIsProcessing(false)
    }
  }

  if (checkoutState === "success" && orderInfo) {
    return (
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-2">
            Your order <span className="text-primary font-mono">{orderInfo.orderNumber}</span> has been placed.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            A confirmation email has been sent to your email address.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Our PRO will review and accept your order shortly.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/orders")}>
              View My Orders
            </Button>
            <Button variant="outline" onClick={() => router.push("/services")}>
              Browse More Services
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (checkoutState === "processing") {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <h2 className="text-xl font-bold mb-2">Processing Payment...</h2>
          <p className="text-muted-foreground">
            Please wait while we process your {selectedMethod === "stripe" ? "card" : selectedMethod === "paypal" ? "PayPal" : "crypto"} payment.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Checkout</span>
          <span className="text-primary">${(priceInCents / 100).toFixed(2)}</span>
        </CardTitle>
        <CardDescription>
          {checkoutState === "select" ? "Select your preferred payment method" : "Enter payment details"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {checkoutState === "select" && (
          <>
            {/* Payment Method Selection */}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    selectedMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      selectedMethod === method.id ? "bg-primary/20" : "bg-muted"
                    )}>
                      <method.icon className={cn(
                        "w-6 h-6",
                        selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{method.name}</span>
                        {method.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {method.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      selectedMethod === method.id ? "border-primary" : "border-muted-foreground"
                    )}>
                      {selectedMethod === method.id && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleProceedToPayment}
            >
              Continue to Payment
            </Button>
          </>
        )}

        {checkoutState === "form" && (
          <>
            {/* Payment Forms */}
            {selectedMethod === "stripe" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <CreditCard className="w-4 h-4" />
                  <span>Credit/Debit Card Payment</span>
                  <Badge variant="outline" className="ml-auto">TEST MODE</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <Input
                    id="card"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="bg-input font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Use 4242 4242 4242 4242 for testing</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="bg-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "paypal" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Wallet className="w-4 h-4" />
                  <span>PayPal Payment</span>
                  <Badge variant="outline" className="ml-auto">TEST MODE</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paypal-email">PayPal Email</Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    placeholder="your@paypal.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="bg-input"
                  />
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                  <p className="text-blue-400">
                    In test mode, enter any email to simulate a PayPal payment.
                  </p>
                </div>
              </div>
            )}

            {selectedMethod === "crypto" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Bitcoin className="w-4 h-4" />
                  <span>Cryptocurrency Payment</span>
                  <Badge variant="outline" className="ml-auto">TEST MODE</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Your Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                    className="bg-input font-mono text-sm"
                  />
                </div>

                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 space-y-2">
                  <p className="text-sm text-orange-400">
                    Amount: <span className="font-mono font-bold">${(priceInCents / 100).toFixed(2)} USD</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    In test mode, enter any wallet address to simulate a crypto payment.
                  </p>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
              <Lock className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
              <Shield className="w-4 h-4 ml-auto text-green-500" />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCheckoutState("select")}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                className="flex-1" 
                size="lg"
                onClick={handleProcessPayment}
                disabled={isProcessing || (
                  (selectedMethod === "stripe" && (!email || !cardNumber || !expiry || !cvc)) ||
                  (selectedMethod === "paypal" && !paypalEmail) ||
                  (selectedMethod === "crypto" && !cryptoWallet)
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ${(priceInCents / 100).toFixed(2)}</>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
