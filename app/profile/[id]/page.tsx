"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingBag, ArrowLeft, Star, MessageSquare, Package, Calendar, Edit } from "lucide-react"
import { getUser } from "@/lib/auth"
import type { UserProfile, Item } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userItems, setUserItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  useEffect(() => {
    const user = getUser()
    setCurrentUser(user)
    loadProfile()
    loadUserItems()
  }, [params.id])

  const loadProfile = async () => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const reviews = JSON.parse(localStorage.getItem("reviews") || "[]")
      const items = JSON.parse(localStorage.getItem("items") || "[]")

      const response = await fetch(`/api/profile/${params.id}`, {
        headers: {
          "x-users-data": JSON.stringify(users),
          "x-reviews-data": JSON.stringify(reviews),
          "x-items-data": JSON.stringify(items),
        },
      })
      const data = await response.json()
      setProfile(data.profile)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
      setLoading(false)
    }
  }

  const loadUserItems = async () => {
    try {
      const response = await fetch(`/api/items?userId=${params.id}`)
      const data = await response.json()
      const activeItems = (data.items || []).filter((item: Item) => item.status === "available")
      setUserItems(activeItems)
    } catch (error) {
      console.error("[v0] Error loading user items:", error)
    }
  }

  const handleSubmitReview = async () => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewedUserId: params.id,
          rating,
          comment,
        }),
      })
      setShowReviewForm(false)
      setComment("")
      setRating(5)
      loadProfile()
    } catch (error) {
      console.error("[v0] Error submitting review:", error)
    }
  }

  const handleContactUser = () => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    router.push(`/messages?userId=${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile not found</h2>
          <Link href="/browse">
            <Button>Browse Items</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === params.id

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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-primary">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(profile.joinedDate || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(profile.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "0.0"} ({profile.totalReviews}{" "}
                      {profile.totalReviews === 1 ? "review" : "reviews"})
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{profile.totalListings}</p>
                      <p className="text-xs text-muted-foreground">Listings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{profile.totalReviews}</p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4">
                    {isOwnProfile ? (
                      <Button onClick={() => router.push("/profile/edit")} className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleContactUser} className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                        <Button onClick={() => setShowReviewForm(!showReviewForm)} variant="outline" className="w-full">
                          <Star className="h-4 w-4 mr-2" />
                          Leave Review
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Form */}
            {showReviewForm && !isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Leave a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                          <Star
                            className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Comment</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmitReview} disabled={!comment.trim()}>
                      Submit Review
                    </Button>
                    <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Listings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Active Listings ({userItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active listings</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {userItems.map((item) => (
                      <Link key={item.id} href={`/item/${item.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
                            {item.images && item.images[0] ? (
                              <img
                                src={item.images[0] || "/placeholder.svg"}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{item.title}</h3>
                            <p className="text-lg font-bold text-primary">${item.price}</p>
                            <Badge variant="secondary" className="mt-2 capitalize">
                              {item.type}
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews ({profile.reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {profile.reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-foreground">{review.reviewerName}</p>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
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
