import { type NextRequest, NextResponse } from "next/server"
import type { UserProfile, Review } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const usersHeader = request.headers.get("x-users-data")
    const reviewsHeader = request.headers.get("x-reviews-data")
    const itemsHeader = request.headers.get("x-items-data")

    const users = usersHeader ? JSON.parse(usersHeader) : []
    const allReviews: Review[] = reviewsHeader ? JSON.parse(reviewsHeader) : []
    const items = itemsHeader ? JSON.parse(itemsHeader) : []

    const user = users.find((u: any) => u.id === params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get reviews for this user
    const userReviews = allReviews.filter((r) => r.reviewedUserId === params.id)

    // Calculate average rating
    const averageRating =
      userReviews.length > 0 ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length : 0

    // Get user's items count
    const userItems = items.filter((item: any) => item.userId === params.id)

    const profile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      joinedDate: user.joinedDate || Date.now(),
      averageRating,
      totalReviews: userReviews.length,
      totalListings: userItems.length,
      reviews: userReviews,
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Profile API error:", error)
    return NextResponse.json({
      profile: {
        id: params.id,
        name: "User",
        email: "",
        bio: "",
        joinedDate: Date.now(),
        averageRating: 0,
        totalReviews: 0,
        totalListings: 0,
        reviews: [],
      },
    })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, bio } = body

    const usersHeader = request.headers.get("x-users-data")
    const users = usersHeader ? JSON.parse(usersHeader) : []

    const userIndex = users.findIndex((u: any) => u.id === params.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    users[userIndex] = {
      ...users[userIndex],
      name,
      bio,
    }

    return NextResponse.json({ success: true, user: users[userIndex], updatedUsers: users })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
