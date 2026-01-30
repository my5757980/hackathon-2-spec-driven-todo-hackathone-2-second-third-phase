// Generated from @specs/ui/components.md
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'bg-[#0a0a0b] border-t border-[#27272a]',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and copyright */}
          <div className="flex items-center gap-2 text-sm text-[#71717a]">
            <span className="font-semibold text-[#fafafa]">TODO</span>
            <span>&copy; {currentYear}</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm text-[#71717a] hover:text-[#fafafa] transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-[#71717a] hover:text-[#fafafa] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-[#71717a] hover:text-[#fafafa] transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
