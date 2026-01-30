// Generated from @specs/ui/pages.md
/**
 * Dashboard page - primary task management interface.
 * Protected route, requires authentication.
 *
 * Updated: 2026-01-29
 * - Improved session handling to reduce 401 errors
 * - Added better error messages for auth failures
 * - Added session_expired query param handling
 */
'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/filter-bar'
import { TaskList, groupTasksByDate, type Task } from '@/components/features/task'
import { TaskForm, type TaskFormData } from '@/components/features/task'
import { api } from '@/lib/api-client'
import { useSession } from '@/lib/auth-client'
import { useToast } from '@/components/ui/toast'

type TabValue = 'all' | 'active' | 'completed'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const { data: session, isPending: isSessionLoading } = useSession()
  const { addToast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('due_date')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [initialFetchDone, setInitialFetchDone] = useState(false)

  // Get user ID from session
  const userId = session?.user?.id

  // Check for session_expired flag on mount
  useEffect(() => {
    const sessionExpired = searchParams.get('session_expired')
    if (sessionExpired === 'true') {
      addToast('Your session has expired. Please sign in again.', 'warning')
      // Clear the URL param
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams, addToast])

  // Fetch tasks from backend on mount
  const fetchTasks = useCallback(async () => {
    if (!userId) {
      console.log('[Dashboard] No user ID available, skipping fetch')
      return
    }

    console.log('[Dashboard] Fetching tasks for user:', userId)
    setIsLoading(true)
    setError(null)

    try {
      // Force refresh the API client token before fetching tasks
      // This ensures we have a fresh token after login/signup
      if (!initialFetchDone) {
        console.log('[Dashboard] First fetch, refreshing JWT token...')
        await api.refreshToken()
        setInitialFetchDone(true)
      }

      const response = await api.getTasks(userId)
      console.log('[Dashboard] Fetched tasks:', response.tasks.length)
      // Map backend task to frontend Task type
      const mappedTasks: Task[] = response.tasks.map((t) => ({
        id: String(t.id),
        title: t.title,
        description: t.description,
        completed: t.completed,
        priority: t.priority,
        due_date: t.due_date,
      }))
      setTasks(mappedTasks)
    } catch (err) {
      console.error('[Dashboard] Failed to fetch tasks:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks'

      // Check if this is a 401 Unauthorized (session expired)
      if (errorMessage.includes('session') || errorMessage.includes('expired') || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError('Your session has expired. Please sign in again.')
        addToast('Session expired. Please sign in again.', 'warning')
      } else {
        setError(errorMessage)
        addToast(errorMessage, 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, initialFetchDone, addToast])

  useEffect(() => {
    // Only fetch tasks once we have confirmed session and user ID
    if (!isSessionLoading && userId) {
      fetchTasks()
    } else if (!isSessionLoading && !userId) {
      // This shouldn't happen due to server-side protection, but handle gracefully
      console.warn('[Dashboard] No user ID after session loaded')
      setIsLoading(false)
    }
  }, [isSessionLoading, userId, fetchTasks])

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Tab filter
    if (activeTab === 'active') {
      result = result.filter((t) => !t.completed)
    } else if (activeTab === 'completed') {
      result = result.filter((t) => t.completed)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      )
    }

    // Priority filter
    if (priority) {
      result = result.filter((t) => t.priority === priority)
    }

    // Status filter
    if (status === 'active') {
      result = result.filter((t) => !t.completed)
    } else if (status === 'completed') {
      result = result.filter((t) => t.completed)
    } else if (status === 'overdue') {
      result = result.filter(
        (t) => !t.completed && t.due_date && new Date(t.due_date) < new Date()
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { P1: 0, P2: 1, P3: 2 }
        const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] : 3
        const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] : 3
        return aPriority - bPriority
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'created_at') {
        return 0 // Would compare created_at if available
      }
      // Default: due_date
      const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity
      const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity
      return aDate - bDate
    })

    return result
  }, [tasks, activeTab, search, priority, status, sortBy])

  // Group tasks by date
  const taskGroups = useMemo(() => {
    if (activeTab === 'completed') {
      // Don't group completed tasks
      return undefined
    }
    return groupTasksByDate(filteredTasks)
  }, [filteredTasks, activeTab])

  // Stats
  const stats = useMemo(() => {
    const all = tasks.length
    const active = tasks.filter((t) => !t.completed).length
    const completed = tasks.filter((t) => t.completed).length
    return { all, active, completed }
  }, [tasks])

  // Handlers
  const handleToggleComplete = async (id: string | number, completed: boolean) => {
    if (!userId) {
      console.error('[Dashboard] Cannot toggle: No user ID')
      return
    }

    console.log('[Dashboard] Toggling task:', id, 'to completed:', completed)

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed,
              completed_at: completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    )

    try {
      await api.updateTask(userId, String(id), { completed })
      console.log('[Dashboard] Task toggle successful')
    } catch (err) {
      console.error('[Dashboard] Failed to toggle task:', err)
      // Revert optimistic update on failure
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: !completed,
                completed_at: !completed ? new Date().toISOString() : undefined,
              }
            : t
        )
      )
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string | number) => {
    if (!userId) {
      console.error('[Dashboard] Cannot delete: No user ID')
      return
    }

    console.log('[Dashboard] Deleting task:', id)

    // Optimistic update
    const previousTasks = tasks
    setTasks((prev) => prev.filter((t) => t.id !== id))

    try {
      await api.deleteTask(userId, String(id))
      console.log('[Dashboard] Task deleted successfully')
    } catch (err) {
      console.error('[Dashboard] Failed to delete task:', err)
      // Revert on failure
      setTasks(previousTasks)
    }
  }

  const handleCreateTask = async (data: TaskFormData) => {
    if (!userId) {
      console.error('[Dashboard] Cannot create task: No user ID')
      return
    }

    console.log('[Dashboard] Creating task:', data)
    console.log('[Dashboard] User ID:', userId)

    try {
      const createdTask = await api.createTask(userId, {
        title: data.title,
        description: data.description,
        priority: data.priority || undefined, // Convert null to undefined for API
        due_date: data.due_date || undefined, // Convert null to undefined for API
      })

      console.log('[Dashboard] Task created successfully:', createdTask)

      // Add the new task to state
      const newTask: Task = {
        id: String(createdTask.id),
        title: createdTask.title,
        description: createdTask.description,
        completed: createdTask.completed,
        priority: createdTask.priority,
        due_date: createdTask.due_date,
      }
      setTasks((prev) => [...prev, newTask])
      setIsFormOpen(false)
    } catch (err) {
      console.error('[Dashboard] Failed to create task:', err)
      setError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask || !userId) {
      console.error('[Dashboard] Cannot update: No editing task or user ID')
      return
    }

    console.log('[Dashboard] Updating task:', editingTask.id, data)

    try {
      const updatedTask = await api.updateTask(userId, String(editingTask.id), {
        title: data.title,
        description: data.description,
        priority: data.priority || undefined, // Convert null to undefined for API
        due_date: data.due_date || undefined, // Convert null to undefined for API
      })

      console.log('[Dashboard] Task updated successfully:', updatedTask)

      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: updatedTask.title,
                description: updatedTask.description,
                priority: updatedTask.priority,
                due_date: updatedTask.due_date,
              }
            : t
        )
      )
      setEditingTask(null)
      setIsFormOpen(false)
    } catch (err) {
      console.error('[Dashboard] Failed to update task:', err)
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setPriority('')
    setStatus('')
  }

  const hasActiveFilters = !!priority || !!status

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Show loading state with skeleton
  if (isSessionLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Greeting skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-64 bg-[#232326] rounded animate-pulse" />
            <div className="h-4 w-48 bg-[#232326] rounded animate-pulse" />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-[#232326] rounded animate-pulse" />
            <div className="h-10 w-24 bg-[#232326] rounded animate-pulse" />
            <div className="h-10 w-24 bg-[#232326] rounded animate-pulse" />
          </div>

          {/* Task cards skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#232326] rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
      {/* Error banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-300 hover:text-red-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#fafafa]">
          {getGreeting()}{session?.user?.name ? `, ${session.user.name}` : ''}!
        </h1>
        <p className="text-[#a1a1aa] mt-1">
          You have {stats.active} task{stats.active !== 1 ? 's' : ''} remaining today.
        </p>
      </div>

      {/* Tabs and Add button */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-1 bg-[#141416] p-1 rounded-lg">
          {[
            { value: 'all' as const, label: `All (${stats.all})` },
            { value: 'active' as const, label: `Active (${stats.active})` },
            { value: 'completed' as const, label: `Completed (${stats.completed})` },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${activeTab === tab.value
                  ? 'bg-[#232326] text-[#fafafa]'
                  : 'text-[#71717a] hover:text-[#fafafa]'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <Button onClick={() => { setEditingTask(null); setIsFormOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        priority={priority}
        onPriorityChange={setPriority}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        className="mb-6"
      />

      {/* Task list */}
      <TaskList
        tasks={taskGroups ? undefined : filteredTasks}
        groups={taskGroups}
        searchQuery={search}
        hasActiveFilters={hasActiveFilters}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateTask={() => setIsFormOpen(true)}
        onClearFilters={handleClearFilters}
      />

      {/* Task form modal */}
      <TaskForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingTask(null)
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask ? {
          title: editingTask.title,
          description: editingTask.description || undefined,
          priority: editingTask.priority,
          category: editingTask.category,
          due_date: editingTask.due_date,
        } : undefined}
        mode={editingTask ? 'edit' : 'create'}
      />

      {/* Floating action button for mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 p-0 shadow-lg"
          onClick={() => { setEditingTask(null); setIsFormOpen(true) }}
          aria-label="Add task"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
