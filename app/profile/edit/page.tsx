"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { ShoppingBag, ArrowLeft, Save, User, FileText } from "lucide-react"
import { getUser } from "@/lib/auth"

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    loadProfile(currentUser.id)
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile/${userId}`)
      const data = await response.json()
      setName(data.profile.name)
      setBio(data.profile.bio || "")
      setLoading(false)
    } catch (error) {
      console.error("Error loading profile:", error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      })

      // Update local storage
      const updatedUser = { ...user, name, bio }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      router.push(`/profile/${user.id}`)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

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
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information to help others get to know you better.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Picture
              </CardTitle>
              <CardDescription>Your profile picture helps others recognize you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={user?.avatar || `/placeholder-user.jpg`} alt={user?.name || "User"} />
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {name.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Profile pictures are displayed across the marketplace
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Photo upload coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your name and bio to personalize your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Name
                </Label>
                <Input 
                  id="name"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your full name"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  This is how your name will appear to other users on the marketplace
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-semibold">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself, your interests, or what you're looking for..."
                  rows={8}
                  className="resize-none text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Share your interests, what you're looking for, or anything else you'd like buyers and sellers to know. 
                  This helps build trust in the community.
                </p>
                <p className="text-xs text-muted-foreground">
                  {bio.length} / 500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => router.back()} size="lg">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!name.trim()} 
              size="lg"
              className="min-w-[140px]"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
