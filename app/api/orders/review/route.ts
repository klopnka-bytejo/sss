import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/neon/server"

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Review API: START')
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    console.log('[v0] Review API: userId =', userId)

    if (!userId) {
      console.log('[v0] Review API: No userId - returning 401')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, rating, title, comment } = body

    console.log('[v0] Review API: orderId =', orderId, 'rating =', rating)

    if (!orderId || !rating) {
      console.log('[v0] Review API: Missing required fields')
      return NextResponse.json(
        { error: "Order ID and rating are required" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      console.log('[v0] Review API: Invalid rating:', rating)
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Get the order
    console.log('[v0] Review API: Fetching order')
    const orders = await sql`
      SELECT id, client_id, pro_id, status FROM orders WHERE id = ${orderId}
    `

    if (!orders || orders.length === 0) {
      console.log('[v0] Review API: Order not found')
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orders[0]

    // Only the client can leave a review
    if (order.client_id !== userId) {
      console.log('[v0] Review API: User is not the client')
      return NextResponse.json(
        { error: "Only the client can leave a review" },
        { status: 403 }
      )
    }

    // Order must be completed
    if (order.status !== "completed" && order.status !== "pending_review") {
      console.log('[v0] Review API: Order status is not completed:', order.status)
      return NextResponse.json(
        { error: "Can only review completed orders" },
        { status: 400 }
      )
    }

    // Check if a review already exists
    console.log('[v0] Review API: Checking for existing review')
    const existingReviews = await sql`
      SELECT id FROM reviews WHERE order_id = ${orderId}
    `

    if (existingReviews && existingReviews.length > 0) {
      console.log('[v0] Review API: Review already exists')
      return NextResponse.json(
        { error: "You have already reviewed this order" },
        { status: 400 }
      )
    }

    // Create the review
    console.log('[v0] Review API: Creating review')
    const reviews = await sql`
      INSERT INTO reviews (
        order_id,
        client_id,
        pro_id,
        rating,
        title,
        comment,
        is_verified_purchase,
        moderation_status,
        created_at,
        updated_at
      ) VALUES (
        ${orderId},
        ${userId},
        ${order.pro_id},
        ${rating},
        ${title || null},
        ${comment || null},
        true,
        'approved',
        NOW(),
        NOW()
      )
      RETURNING id
    `

    console.log('[v0] Review API: Review created:', reviews[0].id)

    // Update PRO's rating in pro_profiles
    if (order.pro_id) {
      console.log('[v0] Review API: Updating PRO rating')
      const stats = await sql`
        SELECT 
          ROUND(AVG(rating)::numeric, 2) as average_rating,
          COUNT(*) as total_reviews
        FROM reviews 
        WHERE pro_id = ${order.pro_id} AND moderation_status = 'approved'
      `

      if (stats && stats.length > 0) {
        console.log('[v0] Review API: Updating pro_profiles with rating:', stats[0].average_rating)
        await sql`
          UPDATE pro_profiles
          SET 
            rating = ${parseFloat(stats[0].average_rating) || 0},
            total_reviews = ${stats[0].total_reviews || 0},
            updated_at = NOW()
          WHERE user_id = ${order.pro_id}
        `
      }
    }

    // Update order status if it was pending_review
    if (order.status === "pending_review") {
      console.log('[v0] Review API: Updating order status to completed')
      await sql`
        UPDATE orders
        SET status = 'completed', updated_at = NOW()
        WHERE id = ${orderId}
      `
    }

    // Log in audit log
    console.log('[v0] Review API: Logging audit trail')
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${userId}, 'review_submitted', 'review', ${reviews[0].id}, ${JSON.stringify({
        order_id: orderId,
        pro_id: order.pro_id,
        rating: rating
      })}, NOW())
    `

    console.log('[v0] Review API: SUCCESS')
    return NextResponse.json({
      success: true,
      reviewId: reviews[0].id,
      message: "Review submitted successfully",
    })
  } catch (error) {
    console.error('[v0] Review API error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('[v0] Review API stack:', error.stack)
    }
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch reviews for a PRO
export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Review API GET: START')
    const { searchParams } = new URL(request.url)
    const proId = searchParams.get('proId')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    if (!proId) {
      console.log('[v0] Review API GET: No proId provided')
      return NextResponse.json({ error: "Pro ID is required" }, { status: 400 })
    }

    const offset = (page - 1) * pageSize

    console.log('[v0] Review API GET: Fetching reviews for pro:', proId, 'page:', page)

    // Fetch paginated reviews
    const reviews = await sql`
      SELECT 
        r.id,
        r.rating,
        r.title,
        r.comment,
        r.created_at,
        r.helpful_count,
        r.unhelpful_count,
        p.display_name as client_name,
        p.avatar_url as client_avatar,
        o.order_number
      FROM reviews r
      JOIN profiles p ON r.client_id = p.id
      JOIN orders o ON r.order_id = o.id
      WHERE r.pro_id = ${proId} AND r.moderation_status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM reviews 
      WHERE pro_id = ${proId} AND moderation_status = 'approved'
    `

    const total = countResult[0]?.total || 0

    console.log('[v0] Review API GET: Found', reviews?.length || 0, 'reviews out of', total, 'total')

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('[v0] Review API GET error:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('[v0] Review API GET stack:', error.stack)
    }
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
