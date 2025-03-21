"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { listExpenses } from "@/lib/expense-api"
import { useAuth } from "@/lib/auth-context"

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search expenses when query changes
  useEffect(() => {
    const searchExpenses = async () => {
      if (!query || !user?.uid) return setResults([])

      setLoading(true)
      try {
        const expenses = await listExpenses(user.uid)

        // Filter expenses based on query
        const filtered = expenses.filter((expense) => {
          const searchTerm = query.toLowerCase()
          return (
            expense.name?.toLowerCase().includes(searchTerm) ||
            expense.category?.toLowerCase().includes(searchTerm) ||
            expense.amount?.toString().includes(searchTerm)
          )
        })

        setResults(filtered.slice(0, 10)) // Limit to 10 results
      } catch (error) {
        console.error("Error searching expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      searchExpenses()
    }
  }, [query, open, user])

  // Format amount as currency
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "$0.00"
    return `$${Number(amount).toFixed(2)}`
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return ""
    }
  }

  // Navigate to expense details
  const navigateToExpense = (id) => {
    setOpen(false)
    router.push(`/dashboard/expenses/${id}`)
  }

  if (!user) return null

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search expenses...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput ref={inputRef} placeholder="Search expenses..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>{loading ? "Searching..." : "No results found."}</CommandEmpty>
          <CommandGroup heading="Expenses">
            {results.map((expense) => (
              <CommandItem
                key={expense.id}
                onSelect={() => navigateToExpense(expense.id)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span>{expense.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {expense.category} • {formatDate(expense.date)}
                  </span>
                </div>
                <span className="font-medium">{formatAmount(expense.amount)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

