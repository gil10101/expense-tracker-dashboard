"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { updateProfile as updateFirebaseProfile } from "firebase/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"
import { db, auth } from "@/lib/firebase"
import { AlertCircle, Check } from "lucide-react"

export function UserProfile() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || user?.displayName || "",
    username: userProfile?.username || user?.username || "",
  })

  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to update your profile.")
      return
    }

    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const userDocRef = doc(db, "users", user.uid)

      // Update Firestore user document
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        username: formData.username,
        updatedAt: serverTimestamp(),
      })

      // Update Firebase auth profile
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: formData.displayName,
        })
      }

      setSuccess("Profile updated successfully!")

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>You must be logged in to view your profile.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Your display name"
              disabled={updating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your username"
              disabled={updating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <div className="p-2 bg-muted rounded-md">
              {userProfile?.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleString() : "Unknown"}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={updating}>
            {updating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 