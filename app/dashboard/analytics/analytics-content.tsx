"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listExpenses } from "@/lib/expense-api"
import { useAuth } from "@/lib/auth-context"
import { RefreshCw, AlertCircle, Loader2, BarChart3, PieChart, LineChart } from "lucide-react"
import { ExpensePieChart } from "../components/expense-pie-chart"
import { ExpenseBarChart } from "../components/expense-bar-chart"
import { ExpenseLineChart } from "../components/expense-line-chart"

export function AnalyticsContent() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("month")
  const { user } = useAuth()

  // Function to fetch expenses
  const fetchExpenses = async () => {
    if (user) {
      try {
        setLoading(true)
        setError(null)

        // Pass the user ID to filter expenses - use uid instead of id
        const data = await listExpenses(user?.uid)
        setExpenses(data || [])

        if (data && Array.isArray(data)) {
          // Filter expenses based on selected time range
          const filteredExpenses = filterExpensesByTimeRange(data, timeRange)
          setExpenses(filteredExpenses)
        } else {
          setExpenses([])
        }
      } catch (err) {
        console.error("Error fetching expenses:", err)
        setError("Failed to load expenses. Please try again later.")
        setExpenses([])
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }

  // Filter expenses based on time range
  const filterExpensesByTimeRange = (expenses, range) => {
    const now = new Date()
    let startDate

    switch (range) {
      case "week":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "quarter":
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 3)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "all":
        return expenses
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= startDate && expenseDate <= now
    })
  }

  // Fetch expenses when component mounts or time range changes
  useEffect(() => {
    fetchExpenses()
  }, [user, timeRange])

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!expense) return acc

    const category = expense.category || "Other"
    const amount = typeof expense.amount === "number" ? expense.amount : 0

    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += amount
    return acc
  }, {})

  // Format data for pie chart
  const pieChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory).map(value => Number(value)),
        backgroundColor: ["#f43f5e", "#3b82f6", "#facc15", "#10b981", "#8b5cf6", "#f97316"],
      },
    ],
  }

  // Prepare data for line chart
  const prepareDailyExpenseData = () => {
    const dateFormat: Intl.DateTimeFormatOptions =
      timeRange === "week"
        ? { month: "short", day: "numeric" }
        : timeRange === "month"
          ? { month: "short", day: "numeric" }
          : timeRange === "quarter"
            ? { month: "short" }
            : { month: "short", year: "numeric" }

    // Group expenses by date
    const expensesByDate: Record<string, number> = {}

    expenses.forEach((expense) => {
      try {
        const date = new Date(expense.date)
        const dateKey = date.toLocaleDateString("en-US", dateFormat)

        if (!expensesByDate[dateKey]) {
          expensesByDate[dateKey] = 0
        }

        expensesByDate[dateKey] += typeof expense.amount === "number" ? expense.amount : 0
      } catch (err) {
        console.error("Error processing date:", err)
      }
    })

    // Sort dates chronologically
    const sortedDates = Object.keys(expensesByDate).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })

    return {
      labels: sortedDates,
      values: sortedDates.map((date) => expensesByDate[date]),
    }
  }

  // Calculate total expenses
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => Number(sum) + Number(amount), 0)

  // Get time range display text
  const getTimeRangeText = () => {
    switch (timeRange) {
      case "week":
        return "Last 7 Days"
      case "month":
        return "This Month"
      case "quarter":
        return "Last 3 Months"
      case "year":
        return "This Year"
      case "all":
        return "All Time"
      default:
        return "This Month"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Analyze your spending patterns</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchExpenses}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchExpenses}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Summary</CardTitle>
          <CardDescription>
            {getTimeRangeText()} - {expenses.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="text-3xl font-bold">${(totalExpenses as number).toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Categories</span>
              <span className="text-3xl font-bold">{Object.keys(expensesByCategory).length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Avg. per Transaction</span>
              <span className="text-3xl font-bold">
                ${expenses.length > 0 ? ((totalExpenses as number) / expenses.length).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {expenses.length > 0 ? (
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pie" className="flex items-center gap-1">
              <PieChart className="h-4 w-4" />
              Category Distribution
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Category Breakdown
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              Spending Trend
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pie">
            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution by Category</CardTitle>
                <CardDescription>
                  Breakdown of your expenses by category for {getTimeRangeText().toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {Object.keys(expensesByCategory).length > 0 ? (
                  <ExpensePieChart data={pieChartData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expense data available for chart
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bar">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>
                  Comparison of spending across different categories for {getTimeRangeText().toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {Object.keys(expensesByCategory).length > 0 ? (
                  <ExpenseBarChart expenses={expenses} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expense data available for chart
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="line">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trend</CardTitle>
                <CardDescription>
                  Track your spending patterns over time for {getTimeRangeText().toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {expenses.length > 0 ? (
                  <ExpenseLineChart data={prepareDailyExpenseData() as any} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expense data available for chart
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        !error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No expenses found</AlertTitle>
            <AlertDescription>No expense data available for the selected time period.</AlertDescription>
          </Alert>
        )
      )}

      {/* Top Spending Categories */}
      {Object.keys(expensesByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>
              Categories where you spent the most for {getTimeRangeText().toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${(amount as number).toFixed(2)}</span>
                      <span className="text-muted-foreground text-sm">
                        ({Math.round(((amount as number) / (totalExpenses as number)) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

