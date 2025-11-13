import { type NextRequest, NextResponse } from "next/server"
import type { Item } from "@/lib/types"

// Mock items database
const items: Item[] = [
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
    createdAt: new Date("2025-01-15").toISOString(),
  },
  {
    id: "2",
    title: "Calculus Textbook",
    description: "Latest edition, no markings. Perfect for MATH 101.",
    price: 45,
    category: "books",
    type: "sale",
    condition: "good",
    status: "available",
    images: ["/calculus-textbook.png"],
    userId: "2",
    createdAt: new Date("2025-01-16").toISOString(),
  },
]

// GET - Fetch items (with optional userId filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const type = searchParams.get("type")

    let filteredItems = items.filter((item) => item.status !== "sold")

    if (userId) {
      filteredItems = items.filter((item) => item.userId === userId)
    }

    if (category && category !== "all") {
      filteredItems = filteredItems.filter((item) => item.category === category)
    }

    if (type && type !== "all") {
      filteredItems = filteredItems.filter((item) => item.type === type)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredItems = filteredItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) || item.description.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json({ items: filteredItems })
  } catch (error) {
    console.error("[v0] Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

// POST - Create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, price, category, type, condition, images, userId } = body

    // Validation
    if (!title || !description || !price || !category || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newItem: Item = {
      id: Date.now().toString(),
      title,
      description,
      price,
      category,
      type: type || "sale",
      condition: condition || "good",
      status: "available",
      images: images || [],
      userId,
      createdAt: new Date().toISOString(),
    }

    items.push(newItem)

    return NextResponse.json({ item: newItem, message: "Item created successfully" })
  } catch (error) {
    console.error("[v0] Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
