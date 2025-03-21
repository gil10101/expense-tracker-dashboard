"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Receipt } from "lucide-react"

interface Transaction {
  id: string
  name: string
  amount: number
  category: string
  date: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  className?: string
}

export function RecentTransactions({ transactions, className }: RecentTransactionsProps) {
  // Function to get category badge variant
  const getCategoryVariant = (category: string) => {
    const categoryVariants: Record<string, "default" | "secondary" | "destructive" | "warning" | "outline"> = {
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

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(undefined, options)
    } catch (e) {
      return "Invalid date"
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
            <CardDescription>Your latest expenses</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Link
                key={transaction.id}
                href={`/dashboard/expenses/${transaction.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{transaction.name}</span>
                  <Badge variant={getCategoryVariant(transaction.category)} className="mt-1 w-fit">
                    {transaction.category}
                  </Badge>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold">${transaction.amount.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Transactions</h3>
            <p className="text-muted-foreground mb-4">You haven't recorded any expenses yet.</p>
            <Link href="/dashboard/expenses/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
      {transactions.length > 0 && (
        <CardFooter className="pt-0">
          <Link href="/dashboard/expenses" className="w-full">
            <Button variant="outline" className="w-full">
              View All Transactions
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}

