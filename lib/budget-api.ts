import { db } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
  serverTimestamp,
} from "firebase/firestore"

// Interface for budget data
export interface Budget {
  id?: string
  category: string
  amount: number
  period: "weekly" | "monthly" | "yearly"
  startDate: string | Date
  endDate?: string | Date
  userId: string
  notes?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Get all budgets for a user
export async function listBudgets(userId?: string) {
  if (!userId) {
    console.log("No userId provided to listBudgets, returning empty array");
    return []
  }

  try {
    console.log("Fetching budgets for user:", userId);
    const budgetsRef = collection(db, "budgets")
    const q = query(budgetsRef, where("userId", "==", userId), orderBy("startDate", "desc"))

    const querySnapshot = await getDocs(q)
    
    console.log(`Fetched ${querySnapshot.docs.length} budgets for user ${userId}`);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      // Convert Firestore Timestamp to Date string
      let startDate = data.startDate;
      let endDate = data.endDate;
      
      if (startDate && typeof startDate.toDate === 'function') {
        startDate = startDate.toDate().toISOString();
      }
      
      if (endDate && typeof endDate.toDate === 'function') {
        endDate = endDate.toDate().toISOString();
      }

      return {
        id: doc.id,
        ...data,
        startDate,
        endDate,
      }
    })
  } catch (error) {
    console.error("Error fetching budgets:", error)
    // Return empty array instead of throwing to prevent UI from breaking
    return []
  }
}

// Create a new budget
export async function createBudget(budgetData: Omit<Budget, "id">) {
  try {
    // Ensure date is a Firestore Timestamp
    const formattedData = {
      ...budgetData,
      startDate:
        budgetData.startDate instanceof Date
          ? Timestamp.fromDate(budgetData.startDate)
          : Timestamp.fromDate(new Date(budgetData.startDate)),
      endDate:
        budgetData.endDate instanceof Date
          ? Timestamp.fromDate(budgetData.endDate)
          : budgetData.endDate
            ? Timestamp.fromDate(new Date(budgetData.endDate))
            : null,
      amount: Number(budgetData.amount),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "budgets"), formattedData)
    return { id: docRef.id, ...budgetData }
  } catch (error) {
    console.error("Error creating budget:", error)
    throw error
  }
}

// Get a single budget by ID
export async function getBudget(id: string) {
  try {
    const docRef = doc(db, "budgets", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      // Convert Firestore Timestamp to Date string
      const startDate = data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate
      const endDate = data.endDate instanceof Timestamp ? data.endDate.toDate().toISOString() : data.endDate

      return {
        id: docSnap.id,
        ...data,
        startDate,
        endDate,
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching budget:", error)
    throw error
  }
}

// Update an existing budget
export async function updateBudget(budgetData: Budget) {
  if (!budgetData.id) {
    throw new Error("Budget ID is required for updates")
  }

  try {
    const { id, ...data } = budgetData

    // Ensure date is a Firestore Timestamp
    const formattedData = {
      ...data,
      startDate:
        data.startDate instanceof Date
          ? Timestamp.fromDate(data.startDate)
          : Timestamp.fromDate(new Date(data.startDate)),
      endDate:
        data.endDate instanceof Date
          ? Timestamp.fromDate(data.endDate)
          : data.endDate
            ? Timestamp.fromDate(new Date(data.endDate))
            : null,
      amount: Number(data.amount),
      updatedAt: serverTimestamp(),
    }

    const docRef = doc(db, "budgets", id)
    await updateDoc(docRef, formattedData)
    return budgetData
  } catch (error) {
    console.error("Error updating budget:", error)
    throw error
  }
}

// Delete a budget
export async function deleteBudget(id: string) {
  try {
    const docRef = doc(db, "budgets", id)
    await deleteDoc(docRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting budget:", error)
    throw error
  }
}

// Get current month's budgets
export async function getCurrentMonthBudgets(userId?: string) {
  if (!userId) {
    console.log("No userId provided to getCurrentMonthBudgets, returning empty array");
    return []
  }

  try {
    console.log("Fetching current month budgets for user:", userId);
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    console.log("Date range:", {
      firstDayOfMonth: firstDayOfMonth.toISOString(),
      lastDayOfMonth: lastDayOfMonth.toISOString()
    });

    const budgetsRef = collection(db, "budgets")
    const q = query(
      budgetsRef,
      where("userId", "==", userId),
      where("period", "==", "monthly"),
      where("startDate", "<=", Timestamp.fromDate(lastDayOfMonth)),
    )

    console.log("Executing Firestore query for current month budgets");
    const querySnapshot = await getDocs(q)
    console.log(`Got ${querySnapshot.docs.length} budget results from Firestore`);

    // Filter budgets that are applicable for the current month
    const budgets = querySnapshot.docs
      .map((doc) => {
        const data = doc.data()
        // Convert Firestore Timestamp to Date
        let startDate = data.startDate;
        let endDate = data.endDate;
        
        if (startDate && typeof startDate.toDate === 'function') {
          startDate = startDate.toDate();
        } else if (startDate) {
          startDate = new Date(startDate);
        }
        
        if (endDate && typeof endDate.toDate === 'function') {
          endDate = endDate.toDate();
        } else if (endDate) {
          endDate = new Date(endDate);
        } else {
          endDate = null;
        }

        return {
          id: doc.id,
          ...data,
          startDate,
          endDate,
        }
      })
      .filter((budget) => {
        // If there's no end date, the budget is ongoing
        if (!budget.endDate) return true

        // Check if the budget's end date is after the first day of the month
        return budget.endDate >= firstDayOfMonth
      })

    console.log(`Returning ${budgets.length} budgets for current month`);
    return budgets
  } catch (error) {
    console.error("Error fetching current month budgets:", error)
    // Return empty array instead of throwing to prevent UI from breaking
    return []
  }
}

// Calculate budget status
export function calculateBudgetStatus(budget: Budget, expenses: any[]) {
  // Filter expenses by category and date range
  const budgetStartDate = new Date(budget.startDate)
  const budgetEndDate = budget.endDate ? new Date(budget.endDate) : new Date()

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const matchesCategory = expense.category === budget.category
    const isInDateRange = expenseDate >= budgetStartDate && expenseDate <= budgetEndDate

    return matchesCategory && isInDateRange
  })

  // Calculate total spent
  const totalSpent = filteredExpenses.reduce((sum, expense) => {
    return sum + (typeof expense.amount === "number" ? expense.amount : 0)
  }, 0)

  // Calculate percentage spent
  const percentageSpent = (totalSpent / budget.amount) * 100

  // Determine status
  let status = "under"
  if (percentageSpent >= 100) {
    status = "over"
  } else if (percentageSpent >= 80) {
    status = "warning"
  }

  return {
    budget,
    totalSpent,
    remaining: budget.amount - totalSpent,
    percentageSpent,
    status,
  }
}

