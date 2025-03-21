import { Suspense } from "react"
import DashboardContent from "./dashboard-content"
import DashboardSkeleton from "./dashboard-skeleton"

export default function DashboardPage() {
  return (
    <div className="container px-4 py-6 md:py-10 mx-auto max-w-7xl">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

