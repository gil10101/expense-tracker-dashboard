"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { listExpenses, deleteExpense, type Expense } from "@/lib/expense-api"
import { useAuth } from "@/lib/auth-context"
import { RefreshCw, AlertCircle, Plus, Pencil, Trash2, Loader2 } from "lucide-react"

export function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { user } = useAuth()

  // Load expenses on component mount
  useEffect(() => {
    if (user) {
      fetchExpenses()
    } else {
      setLoading(false)
    }
  }, [user])

  // Function to fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true)
      setError(null)

      // Debug logs
      console.log("Current user:", user);
      console.log("User ID being used for query:", user?.uid);

      // Pass the user ID to filter expenses - change from user?.id to user?.uid
      const data = await listExpenses(user?.uid);
      
      console.log("Expenses data received:", data);

      // If we got data, process it
      if (data && Array.isArray(data)) {
        // Reset retry count on success
        setRetryCount(0)

        // Sort expenses by date (newest first) - with null safety
        const sortedExpenses = [...data].sort((a, b) => {
          // Handle missing dates
          if (!a.date) return 1
          if (!b.date) return -1

          try {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            return dateB - dateA // Compare timestamps as numbers
          } catch (err) {
            console.error("Date sorting error:", err)
            return 0
          }
        })

        setExpenses(sortedExpenses)
      } else {
        // If no data returned, set empty array
        setExpenses([])
        // Only show error if this wasn't a retry attempt
        if (retryCount === 0) {
          setError("No expense data available. Please try again later.")
        }
      }
    } catch (err) {
      console.error("Error fetching expenses:", err)
      setError("Failed to load expenses. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Function to handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    fetchExpenses()
  }

  // Function to handle expense deletion
  const handleDelete = async (id: string) => {
    if (!id || !window.confirm("Are you sure you want to delete this expense?")) return

    try {
      setDeleteLoading(true)
      await deleteExpense(id)
      
      // Filter out the deleted expense from current state
      setExpenses(expenses.filter(expense => expense.id !== id))
    } catch (err: any) {
      console.error("Error deleting expense:", err)
      setError(err.message || "Failed to delete expense. Please try again later.")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Function to format date
  const formatDate = (dateString: string | Date | undefined | null) => {
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
        if (typeof dateString === 'string') {
          if (dateString.includes("T")) {
            // It's an ISO format but might be malformed
            const datePart = dateString.split("T")[0]
            const [year, month, day] = datePart.split("-")
            const yearNum = parseInt(year, 10)
            const monthNum = parseInt(month, 10) - 1
            const dayNum = parseInt(day, 10)
            dateObj = new Date(yearNum, monthNum, dayNum)
          } else if (dateString.includes(" ")) {
            // It's a MySQL format
            const datePart = dateString.split(" ")[0]
            const [year, month, day] = datePart.split("-")
            const yearNum = parseInt(year, 10)
            const monthNum = parseInt(month, 10) - 1
            const dayNum = parseInt(day, 10)
            dateObj = new Date(yearNum, monthNum, dayNum)
          } else {
            // It's just a date string YYYY-MM-DD
            const [year, month, day] = dateString.split("-")
            const yearNum = parseInt(year, 10)
            const monthNum = parseInt(month, 10) - 1
            const dayNum = parseInt(day, 10)
            dateObj = new Date(yearNum, monthNum, dayNum)
          }
        } else {
          dateObj = new Date(dateString)
        }
      } catch (err) {
        console.error("Error parsing date:", dateString, err)
        return "Invalid date"
      }
    }

    return dateObj.toLocaleDateString(undefined, options as Intl.DateTimeFormatOptions)
  }

  // Function to get category badge variant
  const getCategoryVariant = (category: string | undefined) => {
    type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "warning";
    
    const categoryVariants: Record<string, BadgeVariant> = {
      Food: "default",
      Transportation: "secondary",
      Housing: "destructive",
      Entertainment: "warning", // Now using warning variant
      Utilities: "outline",
      Healthcare: "secondary",
      Education: "default",
      Other: "outline",
    }

    return (category && categoryVariants[category]) ? categoryVariants[category] : "outline" as const
  }

  // Function to safely format amount
  const formatAmount = (amount: number | string | undefined | null): string => {
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
        <p className="text-muted-foreground">Loading expenses...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
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
          <Link href="/dashboard/expenses/add">
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Expense
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

      {expenses.length === 0 && !error ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No expenses found</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Click the "Add Expense" button to create one.</span>
            <Link href="/dashboard/expenses/add">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id || `expense-${Math.random()}`}>
                      <TableCell className="font-medium">{expense.name || "Unnamed Expense"}</TableCell>
                      <TableCell>{formatAmount(expense.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getCategoryVariant(expense.category)}>
                          {expense.category || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/expenses/${expense.id}/edit`}>
                            <Button variant="outline" size="icon">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deleteLoading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

