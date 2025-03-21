"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface ExpenseTrendsProps {
  data: {
    date: string
    amount: number
  }[]
  className?: string
}

export function ExpenseTrends({ data, className }: ExpenseTrendsProps) {
  // Calculate 7-day moving average
  const movingAverageData = [...data]

  for (let i = 0; i < data.length; i++) {
    let sum = 0
    let count = 0

    // Look back up to 7 days
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      sum += data[j].amount
      count++
    }

    movingAverageData[i] = {
      ...data[i],
      average: sum / count,
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Expense Trends</CardTitle>
        <CardDescription>Daily spending with 7-day moving average</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {data.length > 0 ? (
          <ChartContainer
            config={{
              amount: {
                label: "Daily Expenses",
                color: "hsl(var(--chart-1))",
              },
              average: {
                label: "7-Day Average",
                color: "hsl(var(--chart-2))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movingAverageData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  tickFormatter={(value) => {
                    // Shorten date format for small screens
                    const date = new Date(value)
                    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} tickMargin={10} tickFormatter={(value) => `$${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-amount)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="var(--color-average)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No expense data available for chart
          </div>
        )}
      </CardContent>
    </Card>
  )
}

