// Generated from @specs/ui/pages.md
/**
 * 404 Not Found page.
 * Displays friendly error message with link back to home.
 */
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-bold text-[#3b82f6]">404</div>
        <h1 className="text-2xl font-bold text-[#fafafa]">Page not found</h1>
        <p className="text-[#a1a1aa]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
