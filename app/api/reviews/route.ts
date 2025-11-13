import { type NextRequest, NextResponse } from "next/server"
import type { Review } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewedUserId, rating, comment } = body

    // Get current user from headers or session
    const userStr = request.headers.get("x-user-data")
    const currentUser = userStr ? JSON.parse(userStr) : null

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create review
    const review: Review = {
      id: Date.now().toString(),
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewedUserId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    }

    // Save review
    const reviewsStr = typeof window !== "undefined" ? localStorage.getItem("reviews") : null
    const reviews = reviewsStr ? JSON.parse(reviewsStr) : []
    reviews.push(review)

    if (typeof window !== "undefined") {
      localStorage.setItem("reviews", JSON.stringify(reviews))
    }

    return NextResponse.json({ success: true, review })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
