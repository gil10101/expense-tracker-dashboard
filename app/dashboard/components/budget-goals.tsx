"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard } from "lucide-react"

interface BudgetGoal {
  id: string
  category: string
  amount: number
  spent: number
  period: string
}

interface BudgetGoalsProps {
  budgets: BudgetGoal[]
  className?: string
}

export function BudgetGoals({ budgets, className }: BudgetGoalsProps) {
  const [expanded, setExpanded] = useState(false)

  // Show only top 3 budgets if not expanded
  const displayBudgets = expanded ? budgets : budgets.slice(0, 3)

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Budget Goals</CardTitle>
            <CardDescription>Track your spending against budget targets</CardDescription>
          </div>
          {budgets.length > 3 && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Show Less" : "Show All"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {budgets.length > 0 ? (
          <div className="space-y-4">
            {displayBudgets.map((budget) => {
              const percentage = Math.min(Math.round((budget.spent / budget.amount) * 100), 100)
              let status = "under"
              let statusColor = "bg-green-500"

              if (percentage >= 100) {
                status = "over"
                statusColor = "bg-red-500"
              } else if (percentage >= 80) {
                status = "warning"
                statusColor = "bg-yellow-500"
              }

              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{budget.category}</div>
                    <Badge
                      className={
                        status === "over" ? "bg-red-500" : status === "warning" ? "bg-yellow-500" : "bg-green-500"
                      }
                    >
                      {status === "over" ? "Over Budget" : status === "warning" ? "Warning" : "Under Budget"}
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" indicatorClassName={statusColor} />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                    </span>
                    <span className={status === "over" ? "text-red-500 font-medium" : ""}>
                      {status === "over"
                        ? `$${(budget.spent - budget.amount).toFixed(2)} over`
                        : `$${(budget.amount - budget.spent).toFixed(2)} left`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Budgets Set</h3>
            <p className="text-muted-foreground mb-4">
              Create budgets to track your spending and stay on top of your finances.
            </p>
            <Link href="/dashboard/budgets/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

