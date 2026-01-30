// Generated from @specs/features/authentication/spec.md
/**
 * TypeScript type definitions for the Todo application.
 */

// Re-export auth types
export type { Session, User } from '@/lib/auth'

// Task types
export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: Priority
  due_date: string | null
  created_at: string
  updated_at: string
}

export type Priority = 'P1' | 'P2' | 'P3'

export interface TaskFilters {
  status?: 'completed' | 'pending' | 'all'
  sort?: 'created_at' | 'due_date' | 'priority'
  order?: 'asc' | 'desc'
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: Priority
  due_date?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  completed?: boolean
  priority?: Priority
  due_date?: string | null
}

export interface TaskListResponse {
  tasks: Task[]
  count: number
}

// API error type
export interface ApiError {
  detail: string
}
