export interface User {
  id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  joinedDate?: string
}

export interface Item {
  id: string
  title: string
  description: string
  price: number
  category: string
  type: "sale" | "rent"
  condition: string
  status: "available" | "sold" | "rented"
  images: string[]
  userId: string
  userName?: string
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  itemId?: string
  content: string
  createdAt: string
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message
  unreadCount: number
}

export interface Notification {
  id: string
  userId: string
  type: "message" | "listing" | "sale" | "general"
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewedUserId: string
  rating: number
  comment: string
  createdAt: string
}

export interface UserProfile extends User {
  averageRating: number
  totalReviews: number
  totalListings: number
  reviews: Review[]
}
