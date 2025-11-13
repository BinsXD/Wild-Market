import { type NextRequest, NextResponse } from "next/server"

// Mock items database (shared with main route)
const items = [
  {
    id: "1",
    title: "MacBook Pro 2021",
    description: "Excellent condition, barely used. Comes with charger and case.",
    price: 1200,
    category: "electronics",
    type: "sale",
    condition: "like-new",
    status: "available",
    images: ["/macbook-pro-laptop.png"],
    userId: "1",
    userName: "Demo User",
    createdAt: new Date("2025-01-15").toISOString(),
  },
]

// GET - Fetch single item
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = items.find((i) => i.id === params.id)

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error("[v0] Error fetching item:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

// PATCH - Update item status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const itemIndex = items.findIndex((i) => i.id === params.id)

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    items[itemIndex] = { ...items[itemIndex], status }

    return NextResponse.json({ item: items[itemIndex], message: "Item updated successfully" })
  } catch (error) {
    console.error("[v0] Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}
