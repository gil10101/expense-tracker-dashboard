"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { listExpenses } from "@/lib/expense-api"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Plus } from "lucide-react"

export function RecentExpensesWidget() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchExpenses = async () => {
      if (user) {
        try {
          setLoading(true)
          // Use uid instead of id for Firebase compatibility
          const data = await listExpenses(user?.uid, { limit: 5, sortBy: "date", sortDirection: "desc" })
          setExpenses(data)
        } catch (error) {
          console.error("Error fetching recent expenses:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchExpenses()
  }, [user])

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const options: Intl.DateTimeFormatOptions = { 
      month: "short" as const, 
      day: "numeric" as const 
    }
    try {
      const dateObj = new Date(dateString)
      if (isNaN(dateObj.getTime())) throw new Error("Invalid date")
      return dateObj.toLocaleDateString(undefined, options)
    } catch (e) {
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Expenses</CardTitle>
        <Link href="/dashboard/expenses">
          <Button variant="outline" className="w-full">
            View All Expenses
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground mb-4">No expenses recorded yet</p>
            <Link href="/dashboard/expenses/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <Link
                key={expense.id}
                href={`/dashboard/expenses/${expense.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{expense.name}</span>
                  <Badge variant={getCategoryVariant(expense.category)} className="mt-1 w-fit">
                    {expense.category}
                  </Badge>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold">${expense.amount.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

