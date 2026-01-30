// Generated from @specs/ui/components.md
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
}

function PageContainer({ children, className, size = 'lg' }: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8',
        maxWidthClasses[size],
        className
      )}
    >
      {children}
    </div>
  )
}

// Centered container for auth pages
interface CenteredContainerProps {
  children: React.ReactNode
  className?: string
}

function CenteredContainer({ children, className }: CenteredContainerProps) {
  return (
    <div
      className={cn(
        'min-h-[calc(100vh-4rem)] flex items-center justify-center',
        'px-4 py-8',
        className
      )}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

// Two-column layout for settings pages
interface TwoColumnLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
}

function TwoColumnLayout({ sidebar, children, className }: TwoColumnLayoutProps) {
  return (
    <div className={cn('flex flex-col lg:flex-row gap-6 lg:gap-8', className)}>
      <aside className="w-full lg:w-64 flex-shrink-0">
        {sidebar}
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}

export { PageContainer, CenteredContainer, TwoColumnLayout }
