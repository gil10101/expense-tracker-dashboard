"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getExpense, deleteExpense } from "@/lib/expense-api"
import { useAuth } from "@/lib/auth-context"
import { Loader2, AlertCircle, ArrowLeft, Pencil, Trash2 } from "lucide-react"

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id && user) {
      fetchExpense(params.id)
    } else {
      setLoading(false)
    }
  }, [params.id, user])

  const fetchExpense = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getExpense(id)

      if (data) {
        setExpense(data)
      } else {
        setError("Expense not found")
      }
    } catch (err) {
      console.error("Error fetching expense:", err)
      setError("Failed to load expense details. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        setDeleteLoading(true)
        await deleteExpense(params.id)
        router.push("/dashboard/expenses")
      } catch (err) {
        console.error("Error deleting expense:", err)
        setError("Failed to delete expense. Please try again later.")
        setDeleteLoading(false)
      }
    }
  }

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const options: Intl.DateTimeFormatOptions = { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }

    try {
      const dateObj = new Date(dateString)
      if (isNaN(dateObj.getTime())) throw new Error("Invalid date")
      return dateObj.toLocaleDateString(undefined, options)
    } catch (e) {
      console.error("Error parsing date:", dateString, e)
      return "Invalid date"
    }
  }

  // Function to get category badge variant
  const getCategoryVariant = (category) => {
    const categoryVariants = {
      Food: "default",
      Transportation: "secondary",
      Housing: "destructive",
      Entertainment: "warning",
      Utilities: "outline",
      Healthcare: "secondary",
      Education: "default",
      Other: "outline",
    }

    return categoryVariants[category] || "outline"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading expense details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-6 md:py-10 mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/expenses")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expenses
          </Button>
        </div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="container px-4 py-6 md:py-10 mx-auto max-w-3xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Expense Not Found</AlertTitle>
          <AlertDescription>The requested expense could not be found.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/expenses")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expenses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:py-10 mx-auto max-w-3xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/dashboard/expenses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Expenses
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{expense.name}</CardTitle>
              <CardDescription>Expense Details</CardDescription>
            </div>
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              getCategoryVariant(expense.category) === 'default' ? 'border-transparent bg-primary text-primary-foreground' :
              getCategoryVariant(expense.category) === 'secondary' ? 'border-transparent bg-secondary text-secondary-foreground' :
              getCategoryVariant(expense.category) === 'destructive' ? 'border-transparent bg-destructive text-destructive-foreground' :
              'text-foreground'
            }`}>
              {expense.category}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Amount</h3>
              <p className="text-3xl font-bold">${expense.amount.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
              <p className="text-lg">{formatDate(expense.date)}</p>
            </div>
          </div>

          {expense.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-base">{expense.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Created By</h3>
            <p className="text-base">{expense.userId}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Link href={`/dashboard/expenses/${expense.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-1">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="flex items-center gap-1"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 