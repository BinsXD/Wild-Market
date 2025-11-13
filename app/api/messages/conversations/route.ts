import { type NextRequest, NextResponse } from "next/server"
import type { Conversation } from "@/lib/types"

// Mock conversations
const conversations: Conversation[] = [
  {
    id: "1-2",
    participants: ["1", "2"],
    lastMessage: {
      id: "2",
      senderId: "2",
      receiverId: "1",
      content: "Yes, it's still available! Would you like to meet up?",
      createdAt: new Date("2025-01-15T10:05:00").toISOString(),
      read: true,
    },
    unreadCount: 0,
  },
]

// GET - Fetch conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Filter conversations for this user
    const userConversations = conversations.filter((c) => c.participants.includes(userId))

    return NextResponse.json({ conversations: userConversations })
  } catch (error) {
    console.error("[v0] Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
