// Generated from @specs/ui/components.md
import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-[#71717a]">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[#fafafa] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#a1a1aa] max-w-[280px] mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Preset empty states for common scenarios
function TasksEmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      }
      title="No tasks yet"
      description="Create your first task to get started on your productivity journey."
      action={{
        label: '+ Create Task',
        onClick: onCreateTask,
      }}
    />
  )
}

function FilteredEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      }
      title="No tasks match your filters"
      description="Try adjusting your filters to see more tasks."
      action={{
        label: 'Clear Filters',
        onClick: onClearFilters,
      }}
    />
  )
}

function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description={`We couldn't find any tasks matching "${query}". Try a different search term.`}
    />
  )
}

export { EmptyState, TasksEmptyState, FilteredEmptyState, SearchEmptyState }
