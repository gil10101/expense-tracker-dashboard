import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="xl" text={message} />
    </div>
  )
}

