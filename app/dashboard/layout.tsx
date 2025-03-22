"use client"

import * as React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "next-themes"
import {
  DollarSign,
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  LogOut,
  BarChart,
  Settings,
  CreditCard,
  User,
  AlertCircle,
  Sun,
  Moon,
  Search,
  Bell,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getInitials } from "@/lib/utils"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { listExpenses } from "@/lib/expense-api"
import { Notification } from "@/components/notifications-panel"
import { NotificationsPanel } from "@/components/notifications-panel"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Handle authentication
  useEffect(() => {
    setIsMounted(true)

    try {
      if (!loading && !user) {
        router.push("/login")
      }
    } catch (err) {
      console.error("Auth check error:", err)
      setError(err instanceof Error ? err : new Error("Authentication error"))
    }
  }, [user, loading, router])

  // Handle keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search expenses when query changes
  useEffect(() => {
    const searchExpenses = async () => {
      if (!searchQuery || !user?.uid) return setSearchResults([])

      setSearchLoading(true)
      try {
        const expenses = await listExpenses(user.uid)

        // Filter expenses based on query
        const filtered = expenses.filter((expense) => {
          const searchTerm = searchQuery.toLowerCase()
          return (
            expense.description?.toLowerCase().includes(searchTerm) ||
            expense.category?.toLowerCase().includes(searchTerm) ||
            expense.amount?.toString().includes(searchTerm)
          )
        })

        setSearchResults(filtered.slice(0, 10)) // Limit to 10 results
      } catch (error) {
        console.error("Error searching expenses:", error)
      } finally {
        setSearchLoading(false)
      }
    }

    if (searchOpen) {
      searchExpenses()
    }
  }, [searchQuery, searchOpen, user])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      setError(error instanceof Error ? error : new Error("Logout error"))
    }
  }

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Navigate to expense details from search
  const navigateToExpense = (id: string) => {
    setSearchOpen(false)
    router.push(`/dashboard/expenses/${id}`)
  }

  // Format amount as currency for search results
  const formatAmount = (amount: number | string | undefined | null) => {
    if (amount === undefined || amount === null) return "$0.00"
    return `$${Number(amount).toFixed(2)}`
  }

  // Format date for search results
  const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return ""
    }
  }

  // Don't render anything until we've checked auth
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">Initializing...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">Loading your account...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto mt-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>An error occurred:</p>
            <pre className="bg-muted p-2 rounded text-sm overflow-auto">{error.message}</pre>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null)
                  window.location.reload()
                }}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Expenses",
      href: "/dashboard/expenses",
      icon: <ListOrdered className="h-5 w-5" />,
    },
    {
      name: "Budgets",
      href: "/dashboard/budgets",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Add Expense",
      href: "/dashboard/expenses/add",
      icon: <PlusCircle className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-card border-r transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b flex items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            {sidebarOpen && <span className="text-lg font-bold">ExpenseTracker3D</span>}
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={`w-full justify-start ${!sidebarOpen ? 'px-2' : ''}`}
                  >
                    {item.icon}
                    {sidebarOpen && <span className="ml-2">{item.name}</span>}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t p-4">
          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start ${!sidebarOpen ? 'px-2' : ''}`}
            >
              <Settings className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">Settings</span>}
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start mt-2 ${!sidebarOpen ? 'px-2' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || user.email || "User"} />
                  <AvatarFallback>{getInitials(user.displayName || user.email || "User")}</AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="ml-2 text-left">
                    <p className="text-sm font-medium truncate max-w-[120px]">
                      {user.displayName || user.email?.split("@")[0] || "User"}
                    </p>
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</p>
                    )}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <h1 className="text-xl font-semibold">
              {navItems.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button
              variant="outline"
              className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 xl:mr-2" />
              <span className="hidden xl:inline-flex">Search expenses...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Notifications */}
            <NotificationsPanel />

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu (Mobile) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || user.email || "User"} />
                    <AvatarFallback>{getInitials(user.displayName || user.email || "User")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search expenses..." value={searchQuery} onValueChange={setSearchQuery} />
        <CommandList>
          <CommandEmpty>{searchLoading ? "Searching..." : "No results found."}</CommandEmpty>
          <CommandGroup heading="Expenses">
            {searchResults.map((expense) => (
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
    </div>
  )
} 