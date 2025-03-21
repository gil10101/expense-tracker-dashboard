"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangeSelectorProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangeSelector({ dateRange, onDateRangeChange, className }: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handlePresetChange = (preset: string) => {
    const today = new Date()
    let from: Date
    let to = today

    switch (preset) {
      case "this-week":
        from = new Date(today)
        from.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
        break
      case "this-month":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "last-month":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        to = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case "this-quarter":
        const quarter = Math.floor(today.getMonth() / 3)
        from = new Date(today.getFullYear(), quarter * 3, 1)
        break
      case "this-year":
        from = new Date(today.getFullYear(), 0, 1)
        break
      case "last-30":
        from = new Date(today)
        from.setDate(today.getDate() - 30)
        break
      case "last-90":
        from = new Date(today)
        from.setDate(today.getDate() - 90)
        break
      default:
        from = new Date(today)
        from.setDate(today.getDate() - 30) // Default to last 30 days
    }

    onDateRangeChange({ from, to })
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="this-quarter">This Quarter</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
          <SelectItem value="last-30">Last 30 Days</SelectItem>
          <SelectItem value="last-90">Last 90 Days</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => {
              onDateRangeChange(range)
              if (range?.from && range?.to) {
                setIsCalendarOpen(false)
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

