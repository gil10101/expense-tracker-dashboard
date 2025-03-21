"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "next-themes"
import { AlertCircle, Check, Download, Upload, User, Bell, Globe, Shield } from "lucide-react"

export function SettingsForm() {
  const {
    user,
    userProfile,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    updateUserSettings,
    loading: authLoading,
  } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [activeTab, setActiveTab] = useState("account")
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    currency: userProfile?.settings?.currency || "USD",
    language: userProfile?.settings?.language || "en",
    notifyBudgetWarnings: userProfile?.settings?.notifications?.budgetAlerts || true,
    notifyWeeklyReports: userProfile?.settings?.notifications?.weeklyReports || true,
    darkMode: theme === "dark",
  })

  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))

    // Handle theme change
    if (name === "darkMode") {
      setTheme(checked ? "dark" : "light")
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setUpdating(true)
      await updateUserProfile(formData.displayName)
      setSuccess("Profile updated successfully")
    } catch (err) {
      setError(err.message || "Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.currentPassword) {
      return setError("Current password is required to update email")
    }

    try {
      setUpdating(true)
      await updateUserEmail(formData.email, formData.currentPassword)
      setSuccess("Email updated successfully")
    } catch (err) {
      setError(err.message || "Failed to update email")
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match")
    }

    if (formData.newPassword.length < 6) {
      return setError("Password must be at least 6 characters")
    }

    try {
      setUpdating(true)
      await updateUserPassword(formData.currentPassword, formData.newPassword)
      setSuccess("Password updated successfully")

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (err) {
      setError(err.message || "Failed to update password")
    } finally {
      setUpdating(false)
    }
  }

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setUpdating(true)

      // Update user settings in Firestore
      await updateUserSettings({
        currency: formData.currency,
        language: formData.language,
        notifications: {
          budgetAlerts: formData.notifyBudgetWarnings,
          weeklyReports: formData.notifyWeeklyReports,
        },
      })

      setSuccess("Preferences updated successfully")
    } catch (err) {
      setError(err.message || "Failed to update preferences")
    } finally {
      setUpdating(false)
    }
  }

  const exportData = () => {
    // In a real app, you would fetch all user data and export it
    const dummyData = {
      user: {
        id: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
      },
      preferences: {
        currency: formData.currency,
        language: formData.language,
        notifications: {
          budgetAlerts: formData.notifyBudgetWarnings,
          weeklyReports: formData.notifyWeeklyReports,
        },
      },
      // This would include expenses, budgets, etc.
    }

    const dataStr = JSON.stringify(dummyData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `expense-tracker-data-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (authLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2">Loading your account...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>You must be logged in to view settings.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Settings</CardTitle>
        <CardDescription>Manage your account settings and preferences</CardDescription>
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
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-100">Success</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="account" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            {/* Profile Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Profile Information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    disabled={updating}
                  />
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  ) : null}
                  Update Profile
                </Button>
              </form>
            </div>

            {/* Email Address */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Email Address</h3>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={updating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={updating}
                    placeholder="Enter your current password"
                  />
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  ) : null}
                  Update Email
                </Button>
              </form>
            </div>

            {/* Data Export/Import */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Data Management</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" disabled className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifyBudgetWarnings">Budget Warnings</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when you're approaching budget limits
                    </p>
                  </div>
                  <Switch
                    id="notifyBudgetWarnings"
                    checked={formData.notifyBudgetWarnings}
                    onCheckedChange={(checked) => handleSwitchChange("notifyBudgetWarnings", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifyWeeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly spending reports and insights</p>
                  </div>
                  <Switch
                    id="notifyWeeklyReports"
                    checked={formData.notifyWeeklyReports}
                    onCheckedChange={(checked) => handleSwitchChange("notifyWeeklyReports", checked)}
                  />
                </div>
              </div>

              <Button className="mt-6" onClick={handlePreferencesUpdate} disabled={updating}>
                {updating ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                ) : null}
                Save Notification Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Display Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={formData.darkMode}
                    onCheckedChange={(checked) => handleSwitchChange("darkMode", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Regional Settings</h3>
              <form onSubmit={handlePreferencesUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  ) : null}
                  Save Preferences
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPasswordSecurity">Current Password</Label>
                  <Input
                    id="currentPasswordSecurity"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={updating}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={updating}
                    placeholder="Enter your new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={updating}
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  ) : null}
                  Update Password
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}

