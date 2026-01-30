// Generated from @specs/ui/components.md
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-12 w-12',
  }

  return (
    <svg
      className={cn(
        'animate-spin text-[#3b82f6]',
        sizeClasses[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

interface LoadingPageProps {
  message?: string
}

function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] gap-4"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p className="text-sm text-[#a1a1aa]">{message}</p>
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-[#1c1c1f] animate-pulse rounded-md',
        className
      )}
    />
  )
}

function TaskCardSkeleton() {
  return (
    <div className="bg-[#141416] border border-[#27272a] rounded-xl p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox skeleton */}
        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />

        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <Skeleton className="h-5 w-3/4" />

          {/* Badges row */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Task list skeleton */}
      <TaskListSkeleton count={5} />
    </div>
  )
}

export {
  Spinner,
  LoadingPage,
  Skeleton,
  TaskCardSkeleton,
  TaskListSkeleton,
  DashboardSkeleton,
}
