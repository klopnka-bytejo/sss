"use client"

// Checkout content component for service purchase flow
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Service, ServiceAddon, Discount, Profile } from "@/lib/types"
import { 
  CreditCard, 
  Wallet, 
  Bitcoin, 
  Shield, 
  Clock, 
  Tag, 
  Plus,
  Check,
  Loader2,
  ArrowLeft,
  Zap,
  Rocket
} from "lucide-react"
import Link from "next/link"

interface CheckoutContentProps {
  service: Service
  addons: ServiceAddon[]
  discounts: Discount[]
  user: Profile | null
}

type PaymentMethod = "stripe" | "paypal" | "crypto"
type SpeedOption = "normal" | "express" | "super"

const speedOptions = {
  normal: { label: "Normal", multiplier: 1.0, description: "Standard delivery time", icon: Clock },
  express: { label: "Express", multiplier: 1.5, description: "50% faster", icon: Zap },
  super: { label: "Super Express", multiplier: 2.0, description: "100% faster", icon: Rocket },
}

export function CheckoutContent({ service, addons, discounts, user }: CheckoutContentProps) {
  const router = useRouter()
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [speedOption, setSpeedOption] = useState<SpeedOption>("normal")
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null)
  const [discountError, setDiscountError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe")
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Fake payment form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [cryptoWallet, setCryptoWallet] = useState("")

  // Calculate totals
  const calculation = useMemo(() => {
    // Base price
    let basePrice = service.price_cents

    // Add speed multiplier
    const speedMultiplier = speedOptions[speedOption].multiplier
    basePrice = Math.round(basePrice * speedMultiplier)

    // Add selected add-ons
    const addonsTotal = addons
      .filter(addon => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => {
        if (addon.is_percentage) {
          return sum + Math.round(basePrice * addon.price_cents / 100)
        }
        return sum + addon.price_cents
      }, 0)

    const subtotal = basePrice + addonsTotal

    // Apply discount
    let discountAmount = 0
    if (appliedDiscount) {
      if (appliedDiscount.discount_type === 'percentage') {
        discountAmount = Math.round(subtotal * appliedDiscount.discount_value / 100)
      } else {
        discountAmount = appliedDiscount.discount_value
      }
    }

    const total = Math.max(0, subtotal - discountAmount)

    return { basePrice, addonsTotal, subtotal, discountAmount, total }
  }, [service.price_cents, selectedAddons, addons, speedOption, appliedDiscount])

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  const applyDiscount = () => {
    setDiscountError("")
    const discount = discounts.find(
      d => d.code?.toLowerCase() === discountCode.toLowerCase()
    )
    if (discount) {
      if (discount.min_order_cents > calculation.subtotal) {
        setDiscountError(`Minimum order amount: $${(discount.min_order_cents / 100).toFixed(2)}`)
        return
      }
      setAppliedDiscount(discount)
    } else {
      setDiscountError("Invalid discount code")
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      const selectedAddonDetails = addons
        .filter(addon => selectedAddons.includes(addon.id))
        .map(addon => ({ id: addon.id, name: addon.name, price_cents: addon.price_cents }))

      const response = await fetch("/api/checkout/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          paymentMethod,
          totalCents: calculation.total,
          subtotalCents: calculation.subtotal,
          discountId: appliedDiscount?.id,
          discountAmountCents: calculation.discountAmount,
          selectedAddons: selectedAddonDetails,
          selectedOptions: {
            speed: speedOption,
            speedMultiplier: speedOptions[speedOption].multiplier
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/orders/${data.orderId}?success=true`)
      } else {
        alert(data.error || "Payment failed")
      }
    } catch (error) {
      alert("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`

  const isPaymentReady = () => {
    if (paymentMethod === "stripe") {
      return cardNumber.length >= 16 && cardExpiry.length >= 4 && cardCvc.length >= 3
    }
    if (paymentMethod === "paypal") {
      return paypalEmail.includes("@")
    }
    if (paymentMethod === "crypto") {
      return cryptoWallet.length >= 10
    }
    return false
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href={`/services/${service.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {service.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{service.game}</Badge>
                  <Badge variant="outline">{service.category}</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Speed Options */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Speed</CardTitle>
              <CardDescription>Choose how fast you want your order completed</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={speedOption} onValueChange={(v) => setSpeedOption(v as SpeedOption)}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(speedOptions).map(([key, option]) => {
                    const Icon = option.icon
                    const extraCost = key === "normal" ? 0 : 
                      Math.round(service.price_cents * (option.multiplier - 1))
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          speedOption === key 
                            ? "border-primary bg-primary/5" 
                            : "border-border/50 hover:border-border"
                        }`}
                      >
                        <RadioGroupItem value={key} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                          {extraCost > 0 && (
                            <p className="text-xs text-primary mt-1">+{formatCurrency(extraCost)}</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Add-ons */}
          {addons.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Extra Services
                </CardTitle>
                <CardDescription>Enhance your order with additional options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {addons.map((addon) => (
                    <label
                      key={addon.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedAddons.includes(addon.id)
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border"
                      }`}
                    >
                      <Checkbox
                        checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={() => toggleAddon(addon.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{addon.name}</span>
                          <span className="text-primary font-semibold">
                            +{formatCurrency(addon.price_cents)}
                          </span>
                        </div>
                        {addon.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {addon.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                  TEST MODE - No real charges
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === "stripe" ? "border-primary bg-primary/5" : "border-border/50"
                  }`}>
                    <RadioGroupItem value="stripe" />
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Card</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === "paypal" ? "border-primary bg-primary/5" : "border-border/50"
                  }`}>
                    <RadioGroupItem value="paypal" />
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">PayPal</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === "crypto" ? "border-primary bg-primary/5" : "border-border/50"
                  }`}>
                    <RadioGroupItem value="crypto" />
                    <Bitcoin className="w-5 h-5" />
                    <span className="font-medium">Crypto</span>
                  </label>
                </div>
              </RadioGroup>

              <Separator />

              {/* Payment Forms */}
              {paymentMethod === "stripe" && (
                <div className="space-y-4">
                  <div>
                    <Label>Card Number</Label>
                    <Input
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use 4242... for testing</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry</Label>
                      <Input
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                      />
                    </div>
                    <div>
                      <Label>CVC</Label>
                      <Input
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div>
                  <Label>PayPal Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                  />
                </div>
              )}

              {paymentMethod === "crypto" && (
                <div>
                  <Label>Wallet Address</Label>
                  <Input
                    placeholder="0x..."
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter any wallet address for testing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50 sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Line Items */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price</span>
                  <span>{formatCurrency(service.price_cents)}</span>
                </div>
                
                {speedOption !== "normal" && (
                  <div className="flex justify-between text-primary">
                    <span>{speedOptions[speedOption].label} Speed</span>
                    <span>+{formatCurrency(calculation.basePrice - service.price_cents)}</span>
                  </div>
                )}

                {selectedAddons.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="font-medium">Add-ons:</p>
                    {addons.filter(a => selectedAddons.includes(a.id)).map(addon => (
                      <div key={addon.id} className="flex justify-between text-muted-foreground">
                        <span>{addon.name}</span>
                        <span>+{formatCurrency(addon.price_cents)}</span>
                      </div>
                    ))}
                  </>
                )}

                <Separator className="my-2" />
                
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculation.subtotal)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-green-500">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {appliedDiscount.code}
                    </span>
                    <span>-{formatCurrency(calculation.discountAmount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Discount Code */}
              <div className="space-y-2">
                <Label>Discount Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    disabled={!!appliedDiscount}
                  />
                  {appliedDiscount ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setAppliedDiscount(null)
                        setDiscountCode("")
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={applyDiscount}
                      disabled={!discountCode}
                    >
                      Apply
                    </Button>
                  )}
                </div>
                {discountError && (
                  <p className="text-xs text-destructive">{discountError}</p>
                )}
                {appliedDiscount && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {appliedDiscount.title} applied!
                  </p>
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculation.total)}
                </span>
              </div>

              {/* Pay Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing || !isPaymentReady()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(calculation.total)}
                  </>
                )}
              </Button>

              {/* Trust Badges */}
              <div className="space-y-2 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure encrypted payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
