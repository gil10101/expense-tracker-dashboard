import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center">
      <DollarSign className="h-12 w-12 text-primary mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  )
}

