"use client"

import { useParams } from "next/navigation"
import { ExpenseForm } from "../../components/expense-form"

export default function EditExpensePage() {
  const params = useParams<{ id: string }>()
  
  return (
    <div className="container px-4 py-6 md:py-10 mx-auto max-w-3xl">
      <ExpenseForm id={params.id} />
    </div>
  )
} 