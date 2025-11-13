import { type NextRequest, NextResponse } from "next/server"
import type { Notification } from "@/lib/types"

// Mock notifications database
const notifications: Notification[] = [
  {
    id: "1",
    userId: "1",
    type: "message",
    title: "New Message",
    message: "You have a new message about your MacBook Pro listing",
    read: false,
    createdAt: new Date("2025-01-15T14:30:00").toISOString(),
  },
  {
    id: "2",
    userId: "1",
    type: "listing",
    title: "Listing Active",
    message: "Your MacBook Pro listing is now live and visible to buyers",
    read: true,
    createdAt: new Date("2025-01-15T10:00:00").toISOString(),
  },
]

// GET - Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const userNotifications = notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ notifications: userNotifications })
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const { userId, type, title, message } = await request.json()

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    }

    notifications.push(newNotification)

    return NextResponse.json({ notification: newNotification })
  } catch (error) {
    console.error("[v0] Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
