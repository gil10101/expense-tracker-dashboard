"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { createExpense, getExpense, updateExpense } from "@/lib/expense-api"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, Check } from "lucide-react"

export function ExpenseForm({ id }: { id?: string }) {
  const router = useRouter()
  const isEditMode = !!id
  const { user, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  })

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditMode)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Predefined categories
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
    "Travel",
    "Gifts",
    "Other",
  ]

  // Fetch expense data if in edit mode
  useEffect(() => {
    if (isEditMode && id && user) {
      const fetchExpense = async () => {
        try {
          setFetchLoading(true)
          setError(null)
          const data = await getExpense(id)

          if (data) {
            setFormData({
              name: data.name || "",
              amount: data.amount?.toString() || "",
              category: data.category || "",
              date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              description: data.description || "",
            })
          } else {
            setError("Expense not found")
          }
        } catch (err) {
          console.error("Error fetching expense:", err)
          setError("Failed to load expense details. Please try again later.")
        } finally {
          setFetchLoading(false)
        }
      }

      fetchExpense()
    }
  }, [id, user, isEditMode])

  // Handle form input changes
  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle select changes
  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, category: value })
  }

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    
    if (!user) {
      setError("You must be logged in to create an expense")
      return
    }

    if (!formData.name.trim()) {
      setError("Please enter a name for the expense")
      return
    }

    if (!formData.amount) {
      setError("Please enter an amount for the expense")
      return
    }

    if (!formData.category) {
      setError("Please select a category for the expense")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const expenseData = {
        ...formData,
        amount,
        userId: user.uid,
      }

      if (isEditMode && id) {
        // Update existing expense
        await updateExpense({ ...expenseData, id })
        setSuccess("Expense updated successfully!")
      } else {
        // Create new expense
        await createExpense(expenseData)
        setSuccess("Expense created successfully!")
        
        // Clear form after creation
        setFormData({
          name: "",
          amount: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
        })
      }

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push("/dashboard/expenses")
      }, 1500)
    } catch (err) {
      console.error("Error saving expense:", err)
      setError("Failed to save expense. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-6">
            <LoadingSpinner />
            <p className="mt-4 text-sm text-muted-foreground">Loading expense details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Expense" : "Add New Expense"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update your expense details below"
            : "Fill out the form below to record a new expense"}
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
          <Alert className="mb-6 bg-green-50 border-green-500 text-green-700">
            <Check className="h-4 w-4 text-green-700" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Expense Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="E.g., Grocery Shopping, Dinner, etc."
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add additional details about this expense..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/expenses")} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : isEditMode ? (
                "Update Expense"
              ) : (
                "Add Expense"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 