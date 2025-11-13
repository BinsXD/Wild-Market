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

// PATCH - Mark notification as read
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { read } = await request.json()
    const notificationIndex = notifications.findIndex((n) => n.id === params.id)

    if (notificationIndex === -1) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    notifications[notificationIndex] = { ...notifications[notificationIndex], read }

    return NextResponse.json({ notification: notifications[notificationIndex] })
  } catch (error) {
    console.error("[v0] Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
