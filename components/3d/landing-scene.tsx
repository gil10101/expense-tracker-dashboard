"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function LandingScene() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 px-4">
      {/* Left side content */}
      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Take Control of Your Finances
        </h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Track your expenses, visualize your spending patterns, and make smarter financial decisions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/dashboard/expenses">
            <Button variant="outline" size="lg">View Demo</Button>
          </Link>
        </div>
      </div>
      
      {/* Right side image */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <Image 
          src="/images/expense-graph.svg" 
          alt="Expense tracking graph" 
          width={500} 
          height={400}
          className="dark:opacity-90"
          priority
        />
      </div>
    </div>
  )
}

