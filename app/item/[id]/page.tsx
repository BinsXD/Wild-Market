"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, ArrowLeft, MessageSquare, User, Star } from "lucide-react"
import { getUser } from "@/lib/auth"
import type { Item } from "@/lib/types"

export default function ItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [sellerRating, setSellerRating] = useState(0)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    loadItem()
  }, [params.id])

  const loadItem = async () => {
    try {
      const response = await fetch(`/api/items/${params.id}`)
      const data = await response.json()
      setItem(data.item)
      if (data.item?.userId) {
        loadSellerRating(data.item.userId)
      }
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading item:", error)
      setLoading(false)
    }
  }

  const loadSellerRating = async (userId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const reviews = JSON.parse(localStorage.getItem("reviews") || "[]")
      const items = JSON.parse(localStorage.getItem("items") || "[]")

      const response = await fetch(`/api/profile/${userId}`, {
        headers: {
          "x-users-data": JSON.stringify(users),
          "x-reviews-data": JSON.stringify(reviews),
          "x-items-data": JSON.stringify(items),
        },
      })
      const data = await response.json()
      setSellerRating(data.profile?.averageRating || 0)
    } catch (error) {
      console.error("[v0] Error loading seller rating:", error)
    }
  }

  const handleContactSeller = () => {
    if (!user) {
      router.push("/login")
      return
    }
    router.push(`/messages?userId=${item?.userId}&itemId=${item?.id}`)
  }

  const handleMarkAsSold = async () => {
    try {
      await fetch(`/api/items/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sold" }),
      })
      loadItem()
    } catch (error) {
      console.error("[v0] Error updating item:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Item not found</h2>
          <Link href="/browse">
            <Button>Browse Items</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === item.userId

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">WILD MARKET</h1>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[selectedImage] || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-3xl font-bold text-foreground">{item.title}</h2>
                <Badge variant={item.status === "sold" ? "secondary" : "default"}>
                  {item.status === "sold" ? "Sold" : item.type === "rent" ? "For Rent" : "For Sale"}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-primary mb-4">
                ${item.price}
                {item.type === "rent" && <span className="text-lg font-normal text-muted-foreground">/day</span>}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Category</p>
                    <p className="font-medium text-foreground capitalize">{item.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Condition</p>
                    <p className="font-medium text-foreground capitalize">{item.condition}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Link href={`/profile/${item.userId}`} className="block">
                  <div className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.userName || "Student Seller"}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          {sellerRating > 0 ? `${sellerRating.toFixed(1)} rating` : "No reviews yet"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                {!isOwner && item.status !== "sold" && (
                  <Button onClick={handleContactSeller} className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                )}
                {isOwner && item.status !== "sold" && (
                  <Button onClick={handleMarkAsSold} variant="outline" className="w-full bg-transparent">
                    Mark as Sold
                  </Button>
                )}
                {item.status === "sold" && (
                  <div className="text-center py-2">
                    <p className="text-muted-foreground">This item has been sold</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
