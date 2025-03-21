import { db } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  limit as firestoreLimit,
} from "firebase/firestore"

// Type definitions
export interface Expense {
  id?: string
  userId: string
  amount: number
  category: string
  description: string
  date: string | Date
  name?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Interface for list expenses options
export interface ListExpensesOptions {
  limit?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
  category?: string
  fromDate?: string | Date
  toDate?: string | Date
  search?: string
}

// Get all expenses for a user
export const listExpenses = async (userId: string, options: ListExpensesOptions = {}) => {
  console.log("listExpenses called with userId:", userId);
  
  if (!userId) {
    console.log("No userId provided to listExpenses, returning empty array");
    return [];
  }

  try {
    const { limit, sortBy = "date", sortDirection = "desc", category, fromDate, toDate, search } = options

    console.log("Creating Firestore query with userId:", userId);
    const expensesRef = collection(db, "expenses")
    let q = query(expensesRef, where("userId", "==", userId))

    // Apply category filter
    if (category) {
      q = query(q, where("category", "==", category))
    }

    // Apply date range filter
    if (fromDate) {
      q = query(q, where("date", ">=", fromDate))
    }
    if (toDate) {
      q = query(q, where("date", "<=", toDate))
    }

    // Apply sorting
    const orderByDirection = sortDirection === "asc" ? "asc" : "desc"
    q = query(q, orderBy(sortBy, orderByDirection))

    // Apply limit
    if (limit) {
      q = query(q, firestoreLimit(limit))
    }

    const querySnapshot = await getDocs(q)
    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Expense[]

    // Apply search filter (client-side)
    if (search) {
      const searchLower = search.toLowerCase()
      return expenses.filter((expense) => {
        return (
          expense.description?.toLowerCase().includes(searchLower) ||
          expense.category?.toLowerCase().includes(searchLower) ||
          expense.amount.toString().includes(searchLower)
        )
      })
    }

    return expenses
  } catch (error) {
    console.error("Error getting expenses:", error)
    throw error
  }
}

// Get a single expense by ID
export const getExpense = async (expenseId: string) => {
  try {
    const expenseRef = doc(db, "expenses", expenseId)
    const expenseSnap = await getDoc(expenseRef)

    if (!expenseSnap.exists()) {
      throw new Error(`Expense with ID ${expenseId} not found`)
    }

    const data = expenseSnap.data()
    // Convert Firestore Timestamp to Date string
    const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date

    return {
      id: expenseSnap.id,
      ...data,
      date,
    } as Expense
  } catch (error) {
    console.error(`Error getting expense ${expenseId}:`, error)
    throw error
  }
}

// Add a new expense
export const createExpense = async (expense: Omit<Expense, "id">) => {
  try {
    // Ensure date is properly formatted
    const formattedExpense = {
      ...expense,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const expensesRef = collection(db, "expenses")
    const docRef = await addDoc(expensesRef, formattedExpense)

    return {
      id: docRef.id,
      ...formattedExpense,
    }
  } catch (error) {
    console.error("Error adding expense:", error)
    throw error
  }
}

// Update an existing expense
export const updateExpense = async (expense: Expense) => {
  try {
    const { id, ...data } = expense

    if (!id) {
      throw new Error("Expense ID is required for updates")
    }

    const expenseRef = doc(db, "expenses", id)

    // Check if expense exists
    const expenseSnap = await getDoc(expenseRef)
    if (!expenseSnap.exists()) {
      throw new Error(`Expense with ID ${id} not found`)
    }

    // Ensure date is properly formatted
    const formattedData = {
      ...data,
      updatedAt: serverTimestamp(),
    }

    // Update the expense
    await updateDoc(expenseRef, formattedData)

    return {
      id,
      ...expenseSnap.data(),
      ...data,
    }
  } catch (error) {
    console.error(`Error updating expense ${expense.id}:`, error)
    throw error
  }
}

// Delete an expense
export const deleteExpense = async (expenseId: string) => {
  try {
    const expenseRef = doc(db, "expenses", expenseId)

    // Check if expense exists
    const expenseSnap = await getDoc(expenseRef)
    if (!expenseSnap.exists()) {
      throw new Error(`Expense with ID ${expenseId} not found`)
    }

    await deleteDoc(expenseRef)
    return true
  } catch (error) {
    console.error(`Error deleting expense ${expenseId}:`, error)
    throw error
  }
}

// Get expenses by category
export const getExpensesByCategory = async (userId: string, fromDate?: Date, toDate?: Date) => {
  try {
    const expenses = await listExpenses(userId, { fromDate, toDate })

    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || "Other"

      if (!acc[category]) {
        acc[category] = {
          total: 0,
          count: 0,
          expenses: [],
        }
      }

      acc[category].total += expense.amount
      acc[category].count += 1
      acc[category].expenses.push(expense)

      return acc
    }, {})

    return expensesByCategory
  } catch (error) {
    console.error("Error getting expenses by category:", error)
    throw error
  }
}

// Get expenses by day
export const getExpensesByDay = async (userId: string, fromDate?: Date, toDate?: Date) => {
  try {
    const expenses = await listExpenses(userId, { fromDate, toDate })

    const expensesByDay = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date)
      const day = date.toISOString().split("T")[0] // YYYY-MM-DD format

      if (!acc[day]) {
        acc[day] = {
          total: 0,
          count: 0,
          expenses: [],
        }
      }

      acc[day].total += expense.amount
      acc[day].count += 1
      acc[day].expenses.push(expense)

      return acc
    }, {})

    return expensesByDay
  } catch (error) {
    console.error("Error getting expenses by day:", error)
    throw error
  }
}

