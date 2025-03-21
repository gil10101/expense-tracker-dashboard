"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CategorySpending {
  category: string
  amount: number
  percentage: number
  color: string
}

interface TopSpendingCategoriesProps {
  categories: CategorySpending[]
  className?: string
}

export function TopSpendingCategories({ categories, className }: TopSpendingCategoriesProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Top Spending Categories</CardTitle>
        <CardDescription>Where your money is going</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.category} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm">${category.amount.toFixed(2)}</span>
                </div>
                <Progress value={category.percentage} className="h-2" indicatorClassName={`bg-[${category.color}]`} />
                <div className="text-xs text-right text-muted-foreground">{category.percentage}% of total</div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">No spending data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

