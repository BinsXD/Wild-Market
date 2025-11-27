"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, ArrowLeft, Star, MessageSquare, Package, Calendar, Edit, TrendingUp, Award, Heart, History } from "lucide-react"
import { getUser } from "@/lib/auth"
import type { UserProfile, Item } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userItems, setUserItems] = useState<Item[]>([])
  const [allUserItems, setAllUserItems] = useState<Item[]>([])
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
      // Get current user from localStorage
      const currentUserStr = localStorage.getItem("user")
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
      
      // Build users array - include current user if it matches the profile ID
      let users = JSON.parse(localStorage.getItem("users") || "[]")
      
      // If viewing own profile and user exists in localStorage but not in users array, add it
      if (currentUser && currentUser.id === params.id) {
        const userExists = users.find((u: any) => u.id === currentUser.id)
        if (!userExists) {
          users = [...users, {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            bio: currentUser.bio || "",
            joinedDate: currentUser.joinedDate || Date.now(),
          }]
        }
      }
      
      // If no users found but we have current user, use it
      if (users.length === 0 && currentUser && currentUser.id === params.id) {
        users = [{
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          bio: currentUser.bio || "",
          joinedDate: currentUser.joinedDate || Date.now(),
        }]
      }

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
      
      // If profile not found but we have current user, create a default profile
      if (!data.profile && currentUser && currentUser.id === params.id) {
        const userItems = items.filter((item: Item) => item.userId === params.id)
        const userReviews = reviews.filter((r: any) => r.reviewedUserId === params.id)
        const averageRating = userReviews.length > 0 
          ? userReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / userReviews.length 
          : 0
        
        setProfile({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          bio: currentUser.bio || "",
          joinedDate: currentUser.joinedDate || Date.now(),
          averageRating,
          totalReviews: userReviews.length,
          totalListings: userItems.length,
          reviews: userReviews,
        })
      } else {
        setProfile(data.profile)
      }
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
      // Fallback: try to create profile from current user
      const currentUserStr = localStorage.getItem("user")
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
      if (currentUser && currentUser.id === params.id) {
        const items = JSON.parse(localStorage.getItem("items") || "[]")
        const reviews = JSON.parse(localStorage.getItem("reviews") || "[]")
        const userItems = items.filter((item: Item) => item.userId === params.id)
        const userReviews = reviews.filter((r: any) => r.reviewedUserId === params.id)
        const averageRating = userReviews.length > 0 
          ? userReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / userReviews.length 
          : 0
        
        setProfile({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          bio: currentUser.bio || "",
          joinedDate: currentUser.joinedDate || Date.now(),
          averageRating,
          totalReviews: userReviews.length,
          totalListings: userItems.length,
          reviews: userReviews,
        })
      }
      setLoading(false)
    }
  }

  const loadUserItems = async () => {
    try {
      // Load from localStorage directly to get all items including history
      const items = JSON.parse(localStorage.getItem("items") || "[]")
      const allItems = items.filter((item: Item) => item.userId === params.id)
      
      // Store all items for history
      setAllUserItems(allItems)
      
      // For display, show active items first
      const activeItems = allItems.filter((item: Item) => item.status === "available")
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
    // Try to create a basic profile from current user as last resort
    const currentUser = getUser()
    if (currentUser && currentUser.id === params.id) {
      const items = JSON.parse(localStorage.getItem("items") || "[]")
      const reviews = JSON.parse(localStorage.getItem("reviews") || "[]")
      const userItems = items.filter((item: Item) => item.userId === params.id)
      const userReviews = reviews.filter((r: any) => r.reviewedUserId === params.id)
      const averageRating = userReviews.length > 0 
        ? userReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / userReviews.length 
        : 0
      
      const fallbackProfile: UserProfile = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        bio: (currentUser as any).bio || "",
        joinedDate: (currentUser as any).joinedDate || Date.now(),
        averageRating,
        totalReviews: userReviews.length,
        totalListings: userItems.length,
        reviews: userReviews,
      }
      
      // Set profile and continue rendering
      if (!profile) {
        setProfile(fallbackProfile)
        setAllUserItems(userItems)
        setUserItems(userItems.filter((item: Item) => item.status === "available"))
        setLoading(false)
        return null // Will re-render with profile
      }
    }
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
          <div className="flex gap-2 justify-center">
            <Link href="/browse">
              <Button>Browse Items</Button>
            </Link>
            {currentUser && (
              <Link href={`/profile/${currentUser.id}`}>
                <Button variant="outline">My Profile</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === params.id

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Hero Section */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Avatar */}
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.avatar || `/placeholder-user.jpg`} alt={profile.name} />
                  <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Profile Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{profile.name}</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {new Date(profile.joinedDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                        {profile.email && (
                          <span className="hidden sm:inline">{profile.email}</span>
                        )}
                      </div>
                    </div>
                    {isOwnProfile ? (
                      <Button onClick={() => router.push("/profile/edit")} size="lg">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleContactUser} size="lg">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          onClick={() => setShowReviewForm(!showReviewForm)} 
                          variant={showReviewForm ? "default" : "outline"}
                          size="lg"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Rating & Stats */}
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(profile.averageRating) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-foreground">
                        {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "0.0"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({profile.totalReviews} {profile.totalReviews === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Package className="h-5 w-5 text-primary" />
                        <p className="text-2xl font-bold text-foreground">{profile.totalListings}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Active Listings</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Award className="h-5 w-5 text-primary" />
                        <p className="text-2xl font-bold text-foreground">{profile.totalReviews}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Total Reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <p className="text-2xl font-bold text-foreground">
                          {profile.averageRating > 0 ? Math.round(profile.averageRating * 20) : 0}%
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Review Form */}
        {showReviewForm && !isOwnProfile && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)} 
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors ${
                          star <= rating 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground/30 hover:text-yellow-400/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Your Review</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this seller..."
                  rows={5}
                  className="resize-none"
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

        {/* Tabs for Listings, History, and Reviews */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Active ({userItems.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History ({allUserItems.length - userItems.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reviews ({profile.reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            {userItems.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Active Listings</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwnProfile 
                      ? "Start selling by creating your first listing!" 
                      : "This user hasn't listed any items yet."}
                  </p>
                  {isOwnProfile && (
                    <Button onClick={() => router.push("/create-listing")}>
                      Create Listing
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map((item) => (
                  <Link key={item.id} href={`/item/${item.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full group">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        {item.images && item.images[0] ? (
                          <img
                            src={item.images[0] || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge 
                          className="absolute top-3 right-3" 
                          variant={item.type === "rent" ? "default" : "secondary"}
                        >
                          {item.type === "rent" ? "Rent" : "Sale"}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xl font-bold text-primary">
                            ₱{item.price}
                            {item.type === "rent" && <span className="text-sm font-normal text-muted-foreground">/day</span>}
                          </p>
                          <Badge variant="outline" className="capitalize text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {allUserItems.filter(item => item.status !== "available").length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <History className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No History</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "Your sold or rented items will appear here." 
                      : "This user hasn't sold or rented any items yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">All Listings</h3>
                  <Badge variant="outline">
                    {allUserItems.filter(item => item.status !== "available").length} completed
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allUserItems
                    .filter(item => item.status !== "available")
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((item) => (
                    <Link key={item.id} href={`/item/${item.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full group opacity-75">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          {item.images && item.images[0] ? (
                            <img
                              src={item.images[0] || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <Badge 
                            className="absolute top-3 right-3" 
                            variant={item.status === "sold" ? "destructive" : item.status === "rented" ? "secondary" : "default"}
                          >
                            {item.status === "sold" ? "Sold" : item.status === "rented" ? "Rented" : item.status}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xl font-bold text-primary">
                              ₱{item.price}
                              {item.type === "rent" && <span className="text-sm font-normal text-muted-foreground">/day</span>}
                            </p>
                            <Badge variant="outline" className="capitalize text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {profile.reviews.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "You haven't received any reviews yet. Keep selling to build your reputation!" 
                      : "This user hasn't received any reviews yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {profile.reviews.map((review, index) => (
                  <Card key={review.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {review.reviewerName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{review.reviewerName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <Separator className="mb-4" />
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
