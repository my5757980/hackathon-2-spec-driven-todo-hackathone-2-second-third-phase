// Generated from @specs/ui/components.md
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, type SelectOption } from '@/components/ui/select'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface TaskFormData {
  title: string
  description?: string
  priority?: 'P1' | 'P2' | 'P3' | null
  category?: string | null
  due_date?: string | null
}

interface TaskFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
  initialData?: Partial<TaskFormData>
  mode?: 'create' | 'edit'
}

const priorityOptions: SelectOption[] = [
  { value: '', label: 'No Priority' },
  { value: 'P1', label: 'High (P1)' },
  { value: 'P2', label: 'Medium (P2)' },
  { value: 'P3', label: 'Low (P3)' },
]

const categoryOptions: SelectOption[] = [
  { value: '', label: 'No Category' },
  { value: 'Work', label: 'Work' },
  { value: 'Personal', label: 'Personal' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Health', label: 'Health' },
  { value: 'Finance', label: 'Finance' },
]

function TaskForm({ open, onClose, onSubmit, initialData, mode = 'create' }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [priority, setPriority] = useState(initialData?.priority || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Task title is required')
      return
    }

    setLoading(true)

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as 'P1' | 'P2' | 'P3' | null || null,
        category: category || null,
        due_date: dueDate || null,
      })

      // Reset form and close
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle(initialData?.title || '')
    setDescription(initialData?.description || '')
    setPriority(initialData?.priority || '')
    setCategory(initialData?.category || '')
    setDueDate(initialData?.due_date || '')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogClose onClose={handleClose} />

      <DialogHeader>
        <DialogTitle>
          {mode === 'create' ? 'Add New Task' : 'Edit Task'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'create'
            ? 'Create a new task to add to your list.'
            : 'Make changes to your task.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="text-sm text-[#ef4444] bg-[#ef4444]/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-sm font-medium text-[#fafafa]">
              Task Title <span className="text-[#ef4444]">*</span>
            </label>
            <Input
              id="task-title"
              type="text"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={error && !title.trim() ? 'Title is required' : undefined}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium text-[#fafafa]">
              Description <span className="text-[#71717a]">(optional)</span>
            </label>
            <textarea
              id="task-description"
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                'w-full rounded-md px-3 py-2 text-sm',
                'bg-[#141416] border border-[#27272a] text-[#fafafa]',
                'placeholder:text-[#71717a]',
                'focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent',
                'transition-colors duration-150',
                'resize-none'
              )}
            />
          </div>

          {/* Priority and Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#fafafa]">
                Priority
              </label>
              <Select
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
                placeholder="Select priority"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#fafafa]">
                Category
              </label>
              <Select
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                placeholder="Select category"
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label htmlFor="task-due-date" className="text-sm font-medium text-[#fafafa]">
              Due Date
            </label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

export { TaskForm }
export type { TaskFormData, TaskFormProps }
