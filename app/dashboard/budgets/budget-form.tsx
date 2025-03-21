"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { createBudget, getBudget, updateBudget, Budget } from "@/lib/budget-api"
import { useAuth } from "@/lib/auth-context"
import { Loader2, AlertCircle, Check } from "lucide-react"
import { serverTimestamp } from "firebase/firestore"

export function BudgetForm({ id }: { id?: string }) {
  const router = useRouter()
  const isEditMode = !!id
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly" as "weekly" | "monthly" | "yearly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  })

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditMode)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Predefined categories - same as expense categories for consistency
  const categories = [
    "Food",
    "Transportation",
    "Housing",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Education",
    "Shopping",
    "Personal",
    "Other",
  ]

  // Fetch budget data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchBudget(id)
    }
  }, [id, isEditMode])

  // Function to fetch budget data
  const fetchBudget = async (budgetId: string) => {
    try {
      setFetchLoading(true)
      const budget = await getBudget(budgetId)

      if (budget) {
        // Format dates for form input (YYYY-MM-DD)
        const formattedStartDate = new Date(budget.startDate).toISOString().split("T")[0]
        const formattedEndDate = budget.endDate ? new Date(budget.endDate).toISOString().split("T")[0] : ""

        setFormData({
          category: budget.category,
          amount: budget.amount.toString(),
          period: budget.period,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          notes: budget.notes || "",
        })
      } else {
        setError("Budget not found")
        router.push("/dashboard/budgets")
      }
    } catch (err) {
      console.error("Error fetching budget:", err)
      setError("Failed to load budget data. Please try again later.")
    } finally {
      setFetchLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Validate required fields
    if (!formData.category || !formData.amount || !formData.period || !formData.startDate) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const budgetData = {
        amount: Number(formData.amount),
        category: formData.category,
        period: formData.period,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        notes: formData.notes,
        userId: user?.uid || "",
        createdAt: isEditMode ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      if (isEditMode && id) {
        await updateBudget({ ...budgetData, id })
        setSuccess("Budget updated successfully!")
      } else {
        await createBudget(budgetData)
        setSuccess("Budget added successfully!")
      }

      // Reset form after submission
      setFormData({
        category: "",
        amount: "",
        period: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        notes: "",
      })

      // Navigate back to budgets list after a short delay
      setTimeout(() => {
        router.push("/dashboard/budgets")
      }, 1500)
    } catch (error) {
      console.error("Error saving budget:", error)
      setError("Failed to save budget. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading budget data...</p>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isEditMode ? "Edit Budget" : "Create New Budget"}
        </CardTitle>
        <CardDescription className="text-center">
          {isEditMode ? "Update your budget details below" : "Set up a new budget to track your spending"}
        </CardDescription>
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
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
              disabled={loading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount ($)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter budget amount"
              step="0.01"
              min="0.01"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Budget Period</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => handleSelectChange("period", value)}
              disabled={loading}
            >
              <SelectTrigger id="period">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Leave blank for ongoing budgets</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes about this budget"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/budgets")} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Budget"
              ) : (
                "Create Budget"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

