import { type NextRequest, NextResponse } from "next/server"

// Mock notifications database (shared)
const notifications = [
  {
    id: "1",
    userId: "1",
    type: "message",
    title: "New Message",
    message: "You have a new message about your MacBook Pro listing",
    read: false,
    createdAt: new Date("2025-01-15T14:30:00").toISOString(),
  },
]

// POST - Mark all notifications as read for a user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    notifications.forEach((notification) => {
      if (notification.userId === userId) {
        notification.read = true
      }
    })

    return NextResponse.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("[v0] Error marking notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
