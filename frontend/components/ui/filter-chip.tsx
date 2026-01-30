// Generated from @specs/ui/components.md
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  onRemove: () => void
  className?: string
}

function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'bg-[#1c1c1f] rounded-full',
        'pl-3 pr-1.5 py-1',
        'text-xs text-[#fafafa]',
        'transition-colors duration-150',
        'hover:bg-[#27272a]',
        className
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className={cn(
          'p-0.5 rounded-full',
          'text-[#71717a] hover:text-[#ef4444]',
          'hover:bg-[#ef4444]/10',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#3b82f6]'
        )}
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}

interface FilterChipGroupProps {
  filters: Array<{ key: string; label: string }>
  onRemove: (key: string) => void
  onClearAll?: () => void
  className?: string
}

function FilterChipGroup({ filters, onRemove, onClearAll, className }: FilterChipGroupProps) {
  if (filters.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs text-[#71717a]">Active filters:</span>
      {filters.map((filter) => (
        <FilterChip
          key={filter.key}
          label={filter.label}
          onRemove={() => onRemove(filter.key)}
        />
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className={cn(
            'text-xs text-[#3b82f6] hover:text-[#2563eb]',
            'transition-colors duration-150',
            'focus:outline-none focus:underline'
          )}
        >
          Clear all
        </button>
      )}
    </div>
  )
}

export { FilterChip, FilterChipGroup }
