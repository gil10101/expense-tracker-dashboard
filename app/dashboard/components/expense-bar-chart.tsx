"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ExpenseBarChartProps {
  expenses: any[]
}

export function ExpenseBarChart({ expenses }: ExpenseBarChartProps) {
  // Group expenses by category
  const categoryMap = expenses.reduce((acc, expense) => {
    const category = expense.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += expense.amount || 0
    return acc
  }, {})

  // Convert to array for chart
  const chartData = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
  }))

  // Sort by amount (highest first)
  chartData.sort((a, b) => b.amount - a.amount)

  // Take top 8 categories
  const topCategories = chartData.slice(0, 8)

  // Colors for bars
  const colors = ["#f43f5e", "#3b82f6", "#facc15", "#10b981", "#8b5cf6", "#f97316", "#ec4899", "#06b6d4"]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-base font-medium">Expenses by Category</CardTitle>
          <CardDescription>Top spending categories</CardDescription>
        </div>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategories} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip
                  formatter={(value) => [`$${value}`, "Amount"]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

