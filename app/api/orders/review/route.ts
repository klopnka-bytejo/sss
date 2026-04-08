import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, rating, comment } = await request.json()

    if (!orderId || !rating) {
      return NextResponse.json(
        { error: "Order ID and rating are required" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Only the client can leave a review
    if (order.client_id !== user.id) {
      return NextResponse.json(
        { error: "Only the client can leave a review" },
        { status: 403 }
      )
    }

    // Order must be completed
    if (order.status !== "completed" && order.status !== "pending_review") {
      return NextResponse.json(
        { error: "Can only review completed orders" },
        { status: 400 }
      )
    }

    // Check if a review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", orderId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this order" },
        { status: 400 }
      )
    }

    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        order_id: orderId,
        client_id: user.id,
        pro_id: order.pro_id,
        rating,
        comment: comment || null,
      })
      .select()
      .single()

    if (reviewError) {
      console.error("Error creating review:", reviewError)
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      )
    }

    // Update PRO's average rating (if they have a pro_profile)
    if (order.pro_id) {
      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("pro_id", order.pro_id)

      if (allReviews && allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

        // Update pro_profiles if it exists
        await supabase
          .from("pro_profiles")
          .update({
            rating: Math.round(avgRating * 10) / 10,
            reviews_count: allReviews.length,
          })
          .eq("id", order.pro_id)
      }
    }

    return NextResponse.json({
      success: true,
      reviewId: review.id,
      message: "Review submitted successfully",
    })
  } catch (error) {
    console.error("Review error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
