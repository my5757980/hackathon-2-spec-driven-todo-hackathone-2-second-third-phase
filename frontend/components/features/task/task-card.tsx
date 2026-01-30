// Generated from @specs/ui/components.md
'use client'

import { useState } from 'react'
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { TaskCheckbox } from './task-checkbox'

interface Task {
  id: string | number
  title: string
  description?: string | null
  completed: boolean
  priority?: 'P1' | 'P2' | 'P3' | null
  category?: string | null
  due_date?: string | null
  completed_at?: string | null
}

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string | number, completed: boolean) => void
  onEdit?: (task: Task) => void
  onDelete?: (id: string | number) => void
  className?: string
}

function TaskCard({ task, onToggleComplete, onEdit, onDelete, className }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if same day
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date()

  return (
    <div
      className={cn(
        'group relative',
        'bg-[#141416] border border-[#27272a] rounded-xl',
        'p-4 transition-all duration-200',
        'hover:border-[#3b82f6]/50 hover:shadow-md',
        task.completed && 'bg-[#0a0a0b] opacity-75',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <TaskCheckbox
          checked={task.completed}
          onChange={(checked) => onToggleComplete(task.id, checked)}
          taskTitle={task.title}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={cn(
              'text-base font-medium text-[#fafafa]',
              'transition-all duration-150',
              task.completed && 'line-through text-[#71717a]'
            )}
          >
            {task.title}
          </h3>

          {/* Description (if exists and not completed) */}
          {task.description && !task.completed && (
            <p className="mt-1 text-sm text-[#a1a1aa] line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Priority badge */}
            {task.priority && (
              <PriorityBadge
                priority={task.priority}
                className={cn(task.completed && 'opacity-50')}
              />
            )}

            {/* Category tag */}
            {task.category && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5',
                  'text-[10px] font-medium',
                  'bg-[#1c1c1f] text-[#a1a1aa]',
                  task.completed && 'opacity-50'
                )}
              >
                {task.category}
              </span>
            )}

            {/* Due date */}
            {task.due_date && !task.completed && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs',
                  isOverdue ? 'text-[#ef4444]' : 'text-[#a1a1aa]'
                )}
              >
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date)}
              </span>
            )}

            {/* Completed date */}
            {task.completed && task.completed_at && (
              <span className="text-xs text-[#71717a]">
                Completed {formatDate(task.completed_at)}
              </span>
            )}
          </div>
        </div>

        {/* Actions dropdown */}
        <div
          className={cn(
            'flex-shrink-0 transition-opacity duration-150',
            isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
          )}
        >
          <DropdownMenu
            trigger={
              <button
                className={cn(
                  'p-1.5 rounded-md',
                  'text-[#71717a] hover:text-[#fafafa]',
                  'hover:bg-[#1c1c1f]',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-[#3b82f6]'
                )}
                aria-label="Task actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
            align="right"
          >
            {onEdit && (
              <DropdownMenuItem
                onClick={() => onEdit(task)}
                icon={<Pencil className="h-4 w-4" />}
              >
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                  danger
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export { TaskCard }
export type { Task, TaskCardProps }
