import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `EG-${dateStr}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      serviceId, 
      paymentMethod, 
      totalCents,
      subtotalCents,
      discountId,
      discountAmountCents,
      selectedAddons,
      selectedOptions,
      requirements 
    } = body

    // Validate payment method
    if (!["stripe", "paypal", "crypto"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
    }

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Verify discount if applied
    if (discountId) {
      const { data: discount } = await supabase
        .from("discounts")
        .select("*")
        .eq("id", discountId)
        .single()

      if (!discount || !discount.is_active) {
        return NextResponse.json({ error: "Invalid discount" }, { status: 400 })
      }

      // Increment discount usage
      await supabase
        .from("discounts")
        .update({ uses_count: discount.uses_count + 1 })
        .eq("id", discountId)
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const orderNumber = generateOrderNumber()

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        client_id: user.id,
        pro_id: service.pro_id,
        service_id: serviceId,
        status: "paid",
        total_cents: totalCents,
        subtotal_cents: subtotalCents,
        discount_id: discountId || null,
        discount_amount_cents: discountAmountCents || 0,
        selected_addons: selectedAddons || [],
        selected_options: selectedOptions || {},
        payment_method: paymentMethod,
        payment_status: "paid",
        requirements: requirements || {},
        notes: `Payment via ${paymentMethod.toUpperCase()}`,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create transaction record
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance_cents")
      .eq("id", user.id)
      .single()

    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "order_payment",
      amount_cents: -totalCents,
      balance_after_cents: (profile?.balance_cents || 0) - totalCents,
      reference_id: order.id,
      description: `Payment for order ${orderNumber} - ${service.title}`,
    })

    // Add system message
    const addonsText = selectedAddons?.length 
      ? ` with ${selectedAddons.length} add-on(s)` 
      : ""
    const discountText = discountAmountCents 
      ? ` (saved $${(discountAmountCents / 100).toFixed(2)} with discount)` 
      : ""

    await supabase.from("order_messages").insert({
      order_id: order.id,
      sender_id: user.id,
      message: `Order placed${addonsText}${discountText}. Total: $${(totalCents / 100).toFixed(2)}. Waiting for PRO to accept.`,
      is_system: true,
    })

    console.log(`[EMAIL] Order confirmation for ${user.email}:`)
    console.log(`  Order: ${orderNumber}`)
    console.log(`  Service: ${service.title}`)
    console.log(`  Amount: $${(totalCents / 100).toFixed(2)}`)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "An error occurred processing your payment" },
      { status: 500 }
    )
  }
}
