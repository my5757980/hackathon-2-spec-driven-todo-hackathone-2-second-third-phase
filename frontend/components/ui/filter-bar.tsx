// Generated from @specs/ui/components.md
'use client'

import { Search, Filter, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Select, type SelectOption } from './select'
import { FilterChipGroup } from './filter-chip'
import { Button } from './button'

const priorityOptions: SelectOption[] = [
  { value: '', label: 'All Priorities' },
  { value: 'P1', label: 'High (P1)' },
  { value: 'P2', label: 'Medium (P2)' },
  { value: 'P3', label: 'Low (P3)' },
]

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
]

const sortOptions: SelectOption[] = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'title', label: 'Title (A-Z)' },
]

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  priority: string
  onPriorityChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  onClearFilters?: () => void
  className?: string
}

function FilterBar({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  onClearFilters,
  className,
}: FilterBarProps) {
  // Build active filters for chips
  const activeFilters: Array<{ key: string; label: string }> = []

  if (priority) {
    const opt = priorityOptions.find(o => o.value === priority)
    if (opt) activeFilters.push({ key: 'priority', label: opt.label })
  }

  if (status) {
    const opt = statusOptions.find(o => o.value === status)
    if (opt) activeFilters.push({ key: 'status', label: opt.label })
  }

  const handleRemoveFilter = (key: string) => {
    if (key === 'priority') onPriorityChange('')
    if (key === 'status') onStatusChange('')
  }

  const handleClearAll = () => {
    onPriorityChange('')
    onStatusChange('')
    onClearFilters?.()
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main filter controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            aria-label="Search tasks"
          />
        </div>

        {/* Filter dropdowns - hidden on mobile, visible on sm+ */}
        <div className="hidden sm:flex gap-2">
          <Select
            options={statusOptions}
            value={status}
            onChange={onStatusChange}
            placeholder="Status"
            className="w-32"
          />
          <Select
            options={priorityOptions}
            value={priority}
            onChange={onPriorityChange}
            placeholder="Priority"
            className="w-32"
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
            placeholder="Sort by"
            className="w-32"
          />
        </div>

        {/* Mobile filter button */}
        <Button
          variant="secondary"
          className="sm:hidden"
          aria-label="Open filters"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Active filter chips */}
      <FilterChipGroup
        filters={activeFilters}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAll}
      />
    </div>
  )
}

// Compact version for mobile bottom sheet
interface CompactFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  onOpenFilters: () => void
  activeFilterCount: number
  className?: string
}

function CompactFilterBar({
  search,
  onSearchChange,
  onOpenFilters,
  activeFilterCount,
  className,
}: CompactFilterBarProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search tasks"
        />
      </div>
      <Button
        variant="secondary"
        onClick={onOpenFilters}
        className="relative"
        aria-label={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
      >
        <Filter className="h-4 w-4" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#3b82f6] text-[10px] text-white flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  )
}

export { FilterBar, CompactFilterBar }
export { priorityOptions, statusOptions, sortOptions }
