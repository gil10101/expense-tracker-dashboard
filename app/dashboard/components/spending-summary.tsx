"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DollarSign, CreditCard, TrendingUp, TrendingDown } from "lucide-react"

interface SpendingSummaryProps {
  totalExpense: number
  totalBudget: number
  expenseCount: number
  previousPeriodExpense?: number
  className?: string
}

export function SpendingSummary({
  totalExpense,
  totalBudget,
  expenseCount,
  previousPeriodExpense,
  className,
}: SpendingSummaryProps) {
  // Calculate budget utilization percentage
  const utilizationPercentage = totalBudget > 0 ? Math.min(Math.round((totalExpense / totalBudget) * 100), 100) : 0

  // Calculate change from previous period
  const hasComparison = previousPeriodExpense !== undefined && previousPeriodExpense > 0
  const changeAmount = hasComparison ? totalExpense - previousPeriodExpense : 0
  const changePercentage = hasComparison ? Math.round((changeAmount / previousPeriodExpense) * 100) : 0
  const isIncrease = changeAmount > 0

  // Determine status color based on budget utilization
  let statusColor = "bg-green-500"
  if (utilizationPercentage >= 100) {
    statusColor = "bg-red-500"
  } else if (utilizationPercentage >= 80) {
    statusColor = "bg-yellow-500"
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Spending Summary</CardTitle>
        <CardDescription>Overview of your spending and budget</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Spent */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Total Spent</div>
            </div>
            <div className="text-3xl font-bold">${totalExpense.toFixed(2)}</div>
            {hasComparison && (
              <div className={`flex items-center text-sm ${isIncrease ? "text-red-500" : "text-green-500"}`}>
                {isIncrease ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                <span>
                  {isIncrease ? "+" : "-"}${Math.abs(changeAmount).toFixed(2)} ({Math.abs(changePercentage)}%)
                  {isIncrease ? " increase" : " decrease"} from previous period
                </span>
              </div>
            )}
            <div className="text-sm text-muted-foreground">{expenseCount} transactions</div>
          </div>

          {/* Budget Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Budget Status</div>
            </div>
            <div className="text-3xl font-bold">{totalBudget > 0 ? `${utilizationPercentage}%` : "No Budget"}</div>
            <div className="space-y-1">
              <Progress value={utilizationPercentage} className="h-2" indicatorClassName={statusColor} />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ${totalExpense.toFixed(2)} of ${totalBudget.toFixed(2)}
                </span>
                <span className={totalExpense > totalBudget ? "text-red-500 font-medium" : ""}>
                  {totalBudget > 0
                    ? totalExpense > totalBudget
                      ? `$${(totalExpense - totalBudget).toFixed(2)} over budget`
                      : `$${(totalBudget - totalExpense).toFixed(2)} remaining`
                    : "Set a budget to track your spending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

