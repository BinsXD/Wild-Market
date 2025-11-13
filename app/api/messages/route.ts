import { type NextRequest, NextResponse } from "next/server"
import type { Message } from "@/lib/types"

// Mock messages database
const messages: Message[] = [
  {
    id: "1",
    senderId: "1",
    receiverId: "2",
    itemId: "1",
    content: "Hi, is this still available?",
    createdAt: new Date("2025-01-15T10:00:00").toISOString(),
    read: true,
  },
  {
    id: "2",
    senderId: "2",
    receiverId: "1",
    itemId: "1",
    content: "Yes, it's still available! Would you like to meet up?",
    createdAt: new Date("2025-01-15T10:05:00").toISOString(),
    read: true,
  },
]

// GET - Fetch messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    // Filter messages for this conversation
    const conversationMessages = messages.filter(
      (m) =>
        (m.senderId === conversationId.split("-")[0] && m.receiverId === conversationId.split("-")[1]) ||
        (m.senderId === conversationId.split("-")[1] && m.receiverId === conversationId.split("-")[0]),
    )

    return NextResponse.json({ messages: conversationMessages })
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const { conversationId, senderId, content } = await request.json()

    if (!conversationId || !senderId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Extract receiver ID from conversation ID
    const participants = conversationId.split("-")
    const receiverId = participants.find((p: string) => p !== senderId) || participants[1]

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    }

    messages.push(newMessage)

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
