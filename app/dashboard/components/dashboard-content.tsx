"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangeSelector } from "./date-range-selector"
import { ExpensePieChart } from "./expense-pie-chart"
import { ExpenseBarChart } from "./expense-bar-chart"
import { ExpenseLineChart } from "./expense-line-chart"
import { RecentTransactions } from "./recent-transactions"
import { SpendingSummary } from "./spending-summary"
import { TopSpendingCategories } from "./top-spending-categories"
import { BudgetGoals } from "./budget-goals"
import { PageLoading } from "@/components/page-loading"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { listExpenses, getExpensesByCategory, getExpensesByDay } from "@/lib/expense-api"
import { getCurrentMonthBudgets, calculateBudgetStatus } from "@/lib/budget-api"
import { useAuth } from "@/lib/auth-context"
import {
  RefreshCw,
  AlertCircle,
  DollarSign,
  FolderOpen,
  Plus,
  PieChart,
  BarChart3,
  LineChart,
  CreditCard,
  LogIn,
} from "lucide-react"

export default function DashboardContent() {
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [budgetStatuses, setBudgetStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalExpense, setTotalExpense] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [previousPeriodExpense, setPreviousPeriodExpense] = useState(0)
  const [categoryData, setCategoryData] = useState({})
  const [dailyData, setDailyData] = useState({})
  const { user, userProfile, loading: authLoading, refreshToken, authError } = useAuth()

  // Get user display name (prefer displayName, fallback to email, then username)
  const userName = userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "User"

  // Function to fetch expenses and budgets
  const fetchData = useCallback(async () => {
    if (!user?.uid) {
      console.log("No user ID available, skipping data fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching dashboard data...");
      console.log("Current user ID:", user.uid);
      
      // Date range for current period (current month)
      const currentDateRange = {
        from: dateRange.from,
        to: dateRange.to,
      };

      console.log("Fetching expenses with date range:", currentDateRange);

      // Date range for previous period (previous month)
      const previousDateRange = {
        from: new Date(dateRange.from.getFullYear(), dateRange.from.getMonth() - 1, 1),
        to: new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), 0),
      };

      console.log("Previous period date range:", previousDateRange);

      // Fetch current period expenses
      const expensesData = await listExpenses(user.uid, {
        fromDate: currentDateRange.from,
        toDate: currentDateRange.to,
      });

      console.log("Expenses data fetched:", expensesData);

      // Fetch previous period expenses for comparison
      const previousPeriodData = await listExpenses(user.uid, {
        fromDate: previousDateRange.from,
        toDate: previousDateRange.to,
      });

      console.log("Previous period data fetched:", previousPeriodData);

      // Fetch budgets
      const budgetsData = await getCurrentMonthBudgets(user.uid);
      console.log("Budgets data fetched:", budgetsData);

      // Get expenses by category for the chart
      const categoryData = await getExpensesByCategory(user.uid, currentDateRange.from, currentDateRange.to);
      console.log("Category data fetched:", categoryData);

      // Get expenses by day for the chart
      const dailyData = await getExpensesByDay(user.uid, currentDateRange.from, currentDateRange.to);
      console.log("Daily data fetched:", dailyData);

      if (expensesData && Array.isArray(expensesData)) {
        setExpenses(expensesData);

        // Calculate total expenses
        const total = expensesData.reduce((sum, expense) => {
          const amount = typeof expense.amount === "number" ? expense.amount : 0;
          return sum + amount;
        }, 0);

        setTotalExpense(total);
        console.log("Total expense calculated:", total);
      } else {
        console.log("No expenses data or not an array, setting empty values");
        setExpenses([]);
        setTotalExpense(0);
      }

      if (previousPeriodData && Array.isArray(previousPeriodData)) {
        // Calculate total expenses for previous period
        const prevTotal = previousPeriodData.reduce((sum, expense) => {
          const amount = typeof expense.amount === "number" ? expense.amount : 0
          return sum + amount
        }, 0)

        setPreviousPeriodExpense(prevTotal)
      } else {
        setPreviousPeriodExpense(0)
      }

      if (budgetsData && Array.isArray(budgetsData)) {
        setBudgets(budgetsData)

        // Calculate budget statuses
        const statuses = budgetsData.map((budget) => calculateBudgetStatus(budget, expensesData || []))
        setBudgetStatuses(statuses)
      } else {
        setBudgets([])
        setBudgetStatuses([])
      }

      setCategoryData(categoryData || {})
      setDailyData(dailyData || {})

      // Reset retry count on success
      setRetryCount(0)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.message || "Failed to load data. Please try again later.")
      setExpenses([])
      setTotalExpense(0)
      setBudgets([])
      setBudgetStatuses([])
      setPreviousPeriodExpense(0)
      setCategoryData({})
      setDailyData({})
    } finally {
      setLoading(false)
    }
  }, [user])

  // Handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    fetchData()
  }

  // Handle date range change
  const handleDateRangeChange = (range) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  // Fetch data when component mounts, user changes, or date range changes
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchData()
      } else {
        setLoading(false)
        setError("Please log in to view your expenses")
      }
    }
  }, [user, authLoading, dateRange, fetchData])

  // Prepare data for charts
  const topCategories = useMemo(() => {
    const categories = Object.entries(categoryData).map(([category, data]) => ({
      category,
      amount: data.total,
      count: data.count,
    }))

    // Sort by amount (highest first)
    return categories.sort((a, b) => b.amount - a.amount)
  }, [categoryData])

  // Format data for pie chart
  const pieChartData = useMemo(() => {
    const labels = topCategories.map((cat) => cat.category)
    const data = topCategories.map((cat) => cat.amount)
    const backgroundColors = ["#f43f5e", "#3b82f6", "#facc15", "#10b981", "#8b5cf6", "#f97316", "#ec4899", "#06b6d4"]

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
        },
      ],
    }
  }, [topCategories])

  // Format data for top spending categories
  const topSpendingCategoriesData = useMemo(() => {
    if (topCategories.length === 0) return []

    const totalSpent = topCategories.reduce((sum, cat) => sum + cat.amount, 0)
    const colors = ["#f43f5e", "#3b82f6", "#facc15", "#10b981", "#8b5cf6", "#f97316", "#ec4899", "#06b6d4"]

    return topCategories.slice(0, 5).map((cat, index) => ({
      category: cat.category,
      amount: cat.amount,
      percentage: Math.round((cat.amount / totalSpent) * 100),
      color: colors[index % colors.length],
    }))
  }, [topCategories])

  // Format data for line chart
  const lineChartData = useMemo(() => {
    // Convert daily data to array format for the chart
    const dailyEntries = Object.entries(dailyData).map(([date, data]) => ({
      date,
      amount: data.total,
    }))

    // Sort by date
    dailyEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Format dates for display
    return dailyEntries.map((entry) => ({
      date: format(new Date(entry.date), "MMM dd"),
      amount: entry.amount,
    }))
  }, [dailyData])

  // Calculate total budget
  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, budget) => sum + budget.amount, 0)
  }, [budgets])

  // Format budget goals data
  const budgetGoalsData = useMemo(() => {
    return budgetStatuses.map((status) => ({
      id: status.budget.id,
      category: status.budget.category,
      amount: status.budget.amount,
      spent: status.totalSpent,
      period: status.budget.period,
    }))
  }, [budgetStatuses])

  // Get current month and year for display
  const dateRangeText = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      if (
        dateRange.from.getMonth() === dateRange.to.getMonth() &&
        dateRange.from.getFullYear() === dateRange.to.getFullYear()
      ) {
        // Same month
        return format(dateRange.from, "MMMM yyyy")
      } else {
        // Different months
        return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
      }
    }
    return format(new Date(), "MMMM yyyy")
  }, [dateRange])

  // If still loading auth, show minimal loading
  if (authLoading) {
    return <PageLoading message="Loading your account..." />
  }

  // If not authenticated, show login message
  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Please log in to view your expenses and dashboard.</span>
            <Link href="/auth/login">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Log In
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // If there's an auth error, show it
  if (authError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{authError}</span>
            <Link href="/login">
              <Button size="sm" variant="outline">
                <LogIn className="h-4 w-4 mr-2" />
                Log In Again
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your finances for {dateRangeText}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-4 w-full sm:w-auto">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            className="w-full sm:w-auto"
          />
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <LoadingSpinner text="Loading your financial data..." />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Spending Summary */}
          <SpendingSummary
            totalExpense={totalExpense}
            totalBudget={totalBudget}
            expenseCount={expenses.length}
            previousPeriodExpense={previousPeriodExpense}
            className="mb-6"
          />

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Expenses</CardTitle>
                <CardDescription>For {dateRangeText}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${totalExpense.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">{expenses.length} transactions</div>
              </CardContent>
              <div className="stat-card-icon">
                <DollarSign className="h-16 w-16" />
              </div>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Budget Status</CardTitle>
                <CardDescription>Overall budget utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {totalBudget > 0 ? `${Math.min(Math.round((totalExpense / totalBudget) * 100), 100)}%` : "No Budget"}
                </div>
                <div className="mt-2">
                  <div className="budget-progress-bar">
                    <div
                      className={`budget-progress-bar-fill ${
                        totalExpense >= totalBudget
                          ? "bg-red-500"
                          : totalExpense >= totalBudget * 0.8
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min((totalExpense / totalBudget) * 100 || 0, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  ${totalExpense.toFixed(2)} of ${totalBudget.toFixed(2)}
                </div>
              </CardContent>
              <div className="stat-card-icon">
                <CreditCard className="h-16 w-16" />
              </div>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Categories</CardTitle>
                <CardDescription>Spending distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{topCategories.length}</div>
                <div className="text-sm text-muted-foreground mt-1">{budgets.length} budgeted categories</div>
              </CardContent>
              <CardFooter className="p-0 pt-4">
                <Link href="/dashboard/expenses/add" className="w-full">
                  <Button variant="outline" className="w-full flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Expense
                  </Button>
                </Link>
              </CardFooter>
              <div className="stat-card-icon">
                <FolderOpen className="h-16 w-16" />
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Charts */}
              <Tabs defaultValue="line" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="line" className="flex items-center gap-1">
                    <LineChart className="h-4 w-4" />
                    Expense Trends
                  </TabsTrigger>
                  <TabsTrigger value="pie" className="flex items-center gap-1">
                    <PieChart className="h-4 w-4" />
                    Distribution
                  </TabsTrigger>
                  <TabsTrigger value="bar" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Categories
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="line">
                  <Card>
                    <CardHeader>
                      <CardTitle>Expense Trends</CardTitle>
                      <CardDescription>Track your spending patterns over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[450px] pb-8">
                      {lineChartData.length > 0 ? (
                        <ExpenseLineChart data={lineChartData} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No expense data available for chart
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="pie">
                  <Card>
                    <CardHeader>
                      <CardTitle>Expense Distribution</CardTitle>
                      <CardDescription>Breakdown of your expenses by category</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[450px] pb-8">
                      {topCategories.length > 0 ? (
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
                      <CardDescription>Comparison of spending across different categories</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[450px] pb-8">
                      {topCategories.length > 0 ? (
                        <ExpenseBarChart expenses={expenses} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No expense data available for chart
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Recent Transactions */}
              <RecentTransactions
                transactions={expenses.slice(0, 5).map((expense) => ({
                  id: expense.id,
                  name: expense.name,
                  amount: expense.amount,
                  category: expense.category,
                  date: expense.date,
                }))}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Top Spending Categories */}
              <TopSpendingCategories categories={topSpendingCategoriesData} />

              {/* Budget Goals */}
              <BudgetGoals budgets={budgetGoalsData} />
            </div>
          </div>

          {expenses.length === 0 && !error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No expenses found</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <span>Click the "Add New Expense" button to create one.</span>
                <Link href="/dashboard/expenses/add">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Expense
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}

