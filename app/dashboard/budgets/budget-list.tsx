"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { listBudgets, deleteBudget, calculateBudgetStatus } from "@/lib/budget-api"
import { listExpenses } from "@/lib/expense-api"
import { useAuth } from "@/lib/auth-context"
import { RefreshCw, AlertCircle, Plus, Pencil, Trash2, Loader2 } from "lucide-react"

export function BudgetList() {
  const [budgets, setBudgets] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budgetStatuses, setBudgetStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { user } = useAuth()

  // Load budgets and expenses on component mount
  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user])

  // Function to fetch budgets and expenses
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Current user:", user)
      
      // Make sure we're using the correct user ID format from Firebase Auth
      const userId = user?.uid || user?.id

      if (!userId) {
        console.error("No user ID available for fetching budgets")
        setError("User authentication error. Please sign in again.")
        setLoading(false)
        return
      }

      console.log("Fetching budgets with user ID:", userId)

      // Fetch budgets and expenses in parallel
      const [budgetsData, expensesData] = await Promise.all([listBudgets(userId), listExpenses(userId)])

      console.log("Budgets data received:", budgetsData)

      // If we got data, process it
      if (budgetsData && Array.isArray(budgetsData)) {
        // Reset retry count on success
        setRetryCount(0)

        // Sort budgets by start date (newest first) - with null safety
        const sortedBudgets = [...budgetsData].sort((a, b) => {
          // Handle missing dates
          if (!a.startDate) return 1
          if (!b.startDate) return -1

          try {
            const dateA = new Date(a.startDate).getTime()
            const dateB = new Date(b.startDate).getTime()
            return dateB - dateA
          } catch (err) {
            console.error("Date sorting error:", err)
            return 0
          }
        })

        setBudgets(sortedBudgets)
      } else {
        // If no data returned, set empty array
        setBudgets([])
      }

      if (expensesData && Array.isArray(expensesData)) {
        setExpenses(expensesData)
      } else {
        setExpenses([])
      }

      // Calculate budget statuses
      if (budgetsData && Array.isArray(budgetsData) && expensesData && Array.isArray(expensesData)) {
        const statuses = budgetsData.map((budget) => calculateBudgetStatus(budget, expensesData))

        setBudgetStatuses(statuses)
      } else {
        setBudgetStatuses([])
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load budgets. Please try again later.")
      setBudgets([])
      setExpenses([])
      setBudgetStatuses([])
    } finally {
      setLoading(false)
    }
  }

  // Function to handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    fetchData()
  }

  // Function to handle budget deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        setDeleteLoading(true)
        await deleteBudget(id)
        // Refresh the budget list
        fetchData()
      } catch (err) {
        console.error("Error deleting budget:", err)
        setError("Failed to delete budget. Please try again later.")
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const options = { year: "numeric", month: "short", day: "numeric" }

    // Parse the date string to a Date object
    let dateObj
    try {
      // Try to parse as is (should work for ISO-8601 format)
      dateObj = new Date(dateString)

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date")
      }
    } catch (e) {
      // Fallback parsing for different formats
      try {
        if (dateString.includes("T")) {
          // It's an ISO format but might be malformed
          const datePart = dateString.split("T")[0]
          const [year, month, day] = datePart.split("-")
          dateObj = new Date(year, month - 1, day)
        } else if (dateString.includes(" ")) {
          // It's a MySQL format
          const datePart = dateString.split(" ")[0]
          const [year, month, day] = datePart.split("-")
          dateObj = new Date(year, month - 1, day)
        } else {
          // It's just a date string YYYY-MM-DD
          const [year, month, day] = dateString.split("-")
          dateObj = new Date(year, month - 1, day)
        }
      } catch (err) {
        console.error("Error parsing date:", dateString, err)
        return "Invalid date"
      }
    }

    return dateObj.toLocaleDateString(undefined, options)
  }

  // Function to get period display text
  const getPeriodText = (period) => {
    switch (period) {
      case "weekly":
        return "Weekly"
      case "monthly":
        return "Monthly"
      case "yearly":
        return "Yearly"
      default:
        return period
    }
  }

  // Function to safely format amount
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "$0.00"

    try {
      // Convert to number if it's a string
      const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
      return `$${numAmount.toFixed(2)}`
    } catch (err) {
      console.error("Error formatting amount:", amount, err)
      return "$0.00"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading budgets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Manage your spending limits</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/dashboard/budgets/add">
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {budgets.length === 0 && !error ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No budgets found</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Click the "Add Budget" button to create one.</span>
            <Link href="/dashboard/budgets/add">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Budget
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetStatuses.map((status) => (
            <Card key={status.budget.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">{status.budget.category}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {getPeriodText(status.budget.period)} Budget: {formatAmount(status.budget.amount)}
                    </div>
                  </div>
                  <Badge
                    className={
                      status.status === "over"
                        ? "bg-red-500"
                        : status.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }
                  >
                    {status.status === "over"
                      ? "Over Budget"
                      : status.status === "warning"
                        ? "Warning"
                        : "Under Budget"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">{formatAmount(status.totalSpent)}</span>
                    </div>
                    <Progress
                      value={Math.min(status.percentageSpent, 100)}
                      className="h-2"
                      indicatorClassName={
                        status.status === "over"
                          ? "bg-red-500"
                          : status.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className={`font-medium ${status.status === "over" ? "text-red-500" : ""}`}>
                        {formatAmount(Math.max(status.remaining, 0))}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div>Start Date: {formatDate(status.budget.startDate)}</div>
                    {status.budget.endDate && <div>End Date: {formatDate(status.budget.endDate)}</div>}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/budgets/${status.budget.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(status.budget.id)}
                      disabled={deleteLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

