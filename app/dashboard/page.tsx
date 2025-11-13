"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Plus, Package, MessageSquare, LogOut, TrendingUp, DollarSign, Eye, User } from "lucide-react"
import { getUser, logout } from "@/lib/auth"
import { NotificationBell } from "@/components/notification-bell"
import type { Item } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldItems: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    loadUserItems(currentUser.id)
  }, [router])

  const loadUserItems = async (userId: string) => {
    try {
      const response = await fetch(`/api/items?userId=${userId}`)
      const data = await response.json()
      const userItems = data.items || []
      setItems(userItems)

      // Calculate stats
      const active = userItems.filter((item: Item) => item.status === "available").length
      const sold = userItems.filter((item: Item) => item.status === "sold").length
      const revenue = userItems
        .filter((item: Item) => item.status === "sold")
        .reduce((sum: number, item: Item) => sum + item.price, 0)

      setStats({
        totalListings: userItems.length,
        activeListings: active,
        soldItems: sold,
        totalRevenue: revenue,
      })
    } catch (error) {
      console.error("[v0] Error loading items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">WILD MARKET</h1>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationBell userId={user.id} />
              <Link href={`/profile/${user.id}`}>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Link href="/browse" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Messages</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Welcome back, {user.name}!</h2>
          <p className="text-muted-foreground">Manage your listings and connect with buyers</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Listings</CardDescription>
              <CardTitle className="text-3xl">{stats.totalListings}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>All time</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Listings</CardDescription>
              <CardTitle className="text-3xl">{stats.activeListings}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>Currently available</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Items Sold</CardDescription>
              <CardTitle className="text-3xl">{stats.soldItems}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Completed sales</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-3xl">${stats.totalRevenue}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>From sold items</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/create-listing">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Create Listing</CardTitle>
                <CardDescription>Post a new item for sale or rent</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/browse">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Browse Items</CardTitle>
                <CardDescription>Discover items from your community</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/messages">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center mb-2">
                  <MessageSquare className="h-5 w-5 text-chart-3" />
                </div>
                <CardTitle className="text-lg">Messages</CardTitle>
                <CardDescription>Chat with buyers and sellers</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* My Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">My Listings</h3>
            <Link href="/create-listing">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Listing
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your listings...</p>
            </div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">No listings yet</h4>
                <p className="text-muted-foreground mb-4">Start selling by creating your first listing</p>
                <Link href="/create-listing">
                  <Button>Create Your First Listing</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      className="absolute top-2 right-2"
                      variant={item.status === "sold" ? "secondary" : item.type === "rent" ? "default" : "default"}
                    >
                      {item.status === "sold" ? "Sold" : item.type === "rent" ? "For Rent" : "For Sale"}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ${item.price}
                        {item.type === "rent" && <span className="text-sm font-normal">/day</span>}
                      </span>
                      <Link href={`/item/${item.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
