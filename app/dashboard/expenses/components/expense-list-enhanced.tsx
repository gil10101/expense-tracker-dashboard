"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listExpenses, deleteExpense } from "@/lib/expense-api"
import { useAuth } from "@/lib/auth-context"
import {
  RefreshCw,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ArrowUpDown,
  Filter,
  X,
  Download,
} from "lucide-react"

export function ExpenseListEnhanced() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const { user } = useAuth()

  // Predefined categories - same as in the form
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

      // Pass the user ID to filter expenses - using uid instead of id
      const data = await listExpenses(user?.uid);
      
      console.log("Expenses data received:", data);

      if (data && Array.isArray(data)) {
        setExpenses(data)
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
  }

  // Function to handle expense deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        setDeleteLoading(true)
        await deleteExpense(id)
        // Refresh the expense list
        fetchExpenses()
      } catch (err) {
        console.error("Error deleting expense:", err)
        setError("Failed to delete expense. Please try again later.")
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const options: Intl.DateTimeFormatOptions = { 
      year: "numeric" as const, 
      month: "short" as const, 
      day: "numeric" as const 
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

  // Function to safely format amount
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "$0.00"

    try {
      const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
      return `$${numAmount.toFixed(2)}`
    } catch (err) {
      console.error("Error formatting amount:", amount, err)
      return "$0.00"
    }
  }

  // Function to toggle sort direction
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Function to filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatAmount(expense.amount).includes(searchTerm)

    // Category filter
    const matchesCategory = categoryFilter === "" || expense.category === categoryFilter

    // Date range filter
    let matchesDateRange = true
    if (dateRange.start && dateRange.end) {
      const expenseDate = new Date(expense.date)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999) // Include the entire end day
      matchesDateRange = expenseDate >= startDate && expenseDate <= endDate
    }

    return matchesSearch && matchesCategory && matchesDateRange
  })

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    } else if (sortField === "amount") {
      return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
    } else if (sortField === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    } else if (sortField === "category") {
      return sortDirection === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
    }
    return 0
  })

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("")
    setDateRange({ start: "", end: "" })
  }

  // Function to export expenses as CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Name", "Amount", "Category", "Date"]
    const csvContent = [
      headers.join(","),
      ...sortedExpenses.map((expense) =>
        [
          `"${expense.name.replace(/"/g, '""')}"`,
          expense.amount,
          `"${expense.category}"`,
          formatDate(expense.date),
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `expenses_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <Badge variant="outline" className="ml-2">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? "item" : "items"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
          <Link href="/dashboard/expenses/add">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                type="date"
                placeholder="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>

            <div>
              <Input
                type="date"
                placeholder="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!searchTerm && !categoryFilter && !dateRange.start && !dateRange.end}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={sortedExpenses.length === 0}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {expenses.length === 0 && !error ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No expenses found</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Click the "Add Expense" button to create one.</span>
            <Link href="/dashboard/expenses/add">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      ) : sortedExpenses.length === 0 ? (
        <Alert>
          <Filter className="h-4 w-4" />
          <AlertTitle>No matching expenses</AlertTitle>
          <AlertDescription>
            No expenses match your current filters. Try adjusting your search criteria.
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
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("amount")}>
                      <div className="flex items-center">
                        Amount
                        {sortField === "amount" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("category")}>
                      <div className="flex items-center">
                        Category
                        {sortField === "category" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>
                      <div className="flex items-center">
                        Date
                        {sortField === "date" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.map((expense) => (
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

