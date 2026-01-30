// Generated from @specs/ui/components.md
'use client'

import { cn } from '@/lib/utils'
import { TaskCard, type Task } from './task-card'
import { TasksEmptyState, FilteredEmptyState, SearchEmptyState } from '@/components/ui/empty-state'
import { TaskListSkeleton } from '@/components/ui/loading'

interface TaskGroup {
  label: string
  tasks: Task[]
  collapsible?: boolean
}

interface TaskListProps {
  tasks?: Task[]
  groups?: TaskGroup[]
  loading?: boolean
  searchQuery?: string
  hasActiveFilters?: boolean
  onToggleComplete: (id: string | number, completed: boolean) => void
  onEdit?: (task: Task) => void
  onDelete?: (id: string | number) => void
  onCreateTask?: () => void
  onClearFilters?: () => void
  className?: string
}

function TaskList({
  tasks,
  groups,
  loading,
  searchQuery,
  hasActiveFilters,
  onToggleComplete,
  onEdit,
  onDelete,
  onCreateTask,
  onClearFilters,
  className,
}: TaskListProps) {
  // Show loading skeleton
  if (loading) {
    return <TaskListSkeleton count={5} />
  }

  // Determine if we have any tasks
  const allTasks = groups
    ? groups.flatMap((g) => g.tasks)
    : tasks || []

  // Empty states
  if (allTasks.length === 0) {
    if (searchQuery) {
      return <SearchEmptyState query={searchQuery} />
    }
    if (hasActiveFilters && onClearFilters) {
      return <FilteredEmptyState onClearFilters={onClearFilters} />
    }
    if (onCreateTask) {
      return <TasksEmptyState onCreateTask={onCreateTask} />
    }
    return null
  }

  // Render grouped tasks
  if (groups) {
    return (
      <div className={cn('space-y-6', className)}>
        {groups.map((group) => (
          <TaskGroupSection
            key={group.label}
            group={group}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  // Render flat list
  return (
    <div className={cn('space-y-3', className)}>
      {allTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

interface TaskGroupSectionProps {
  group: TaskGroup
  onToggleComplete: (id: string | number, completed: boolean) => void
  onEdit?: (task: Task) => void
  onDelete?: (id: string | number) => void
}

function TaskGroupSection({ group, onToggleComplete, onEdit, onDelete }: TaskGroupSectionProps) {
  if (group.tasks.length === 0) return null

  return (
    <section>
      <h3 className="text-sm font-medium text-[#a1a1aa] mb-3 flex items-center gap-2">
        {group.label}
        <span className="text-xs text-[#71717a]">({group.tasks.length})</span>
      </h3>
      <div className="space-y-3">
        {group.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  )
}

// Utility to group tasks by date
function groupTasksByDate(tasks: Task[]): TaskGroup[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const groups: Record<string, Task[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
    noDueDate: [],
    completed: [],
  }

  tasks.forEach((task) => {
    if (task.completed) {
      groups.completed.push(task)
      return
    }

    if (!task.due_date) {
      groups.noDueDate.push(task)
      return
    }

    const dueDate = new Date(task.due_date)
    dueDate.setHours(0, 0, 0, 0)

    if (dueDate < today) {
      groups.overdue.push(task)
    } else if (dueDate.getTime() === today.getTime()) {
      groups.today.push(task)
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      groups.tomorrow.push(task)
    } else if (dueDate < nextWeek) {
      groups.thisWeek.push(task)
    } else {
      groups.later.push(task)
    }
  })

  return [
    { label: 'Overdue', tasks: groups.overdue },
    { label: 'Today', tasks: groups.today },
    { label: 'Tomorrow', tasks: groups.tomorrow },
    { label: 'This Week', tasks: groups.thisWeek },
    { label: 'Later', tasks: groups.later },
    { label: 'No Due Date', tasks: groups.noDueDate },
    { label: 'Completed', tasks: groups.completed, collapsible: true },
  ].filter((g) => g.tasks.length > 0)
}

export { TaskList, groupTasksByDate }
export type { TaskGroup, TaskListProps }
