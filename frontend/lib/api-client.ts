// Generated from @specs/features/authentication/spec.md
/**
 * API Client with JWT token attachment.
 * Automatically fetches JWT token from Better Auth and attaches it
 * as a Bearer token in the Authorization header for all backend API requests.
 *
 * Updated: 2026-01-29
 * - Added retry logic for token fetch
 * - Improved 401 handling with toast notifications
 * - Added debug logging for troubleshooting
 */

import { getJwtToken } from './auth-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Debug flag - set to true to see detailed API client logs
const DEBUG = process.env.NODE_ENV === 'development'

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[API Client]', ...args)
  }
}

function warn(...args: any[]) {
  console.warn('[API Client]', ...args)
}

function error(...args: any[]) {
  console.error('[API Client]', ...args)
}

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: 'P1' | 'P2' | 'P3'
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskFilters {
  status?: 'completed' | 'pending' | 'all'
  sort?: 'created_at' | 'due_date' | 'priority'
  order?: 'asc' | 'desc'
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: 'P1' | 'P2' | 'P3'
  due_date?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  completed?: boolean
  priority?: 'P1' | 'P2' | 'P3'
  due_date?: string | null
}

export interface TaskListResponse {
  tasks: Task[]
  count: number
}

export interface ApiError {
  detail: string
}

class ApiClient {
  private baseUrl: string
  // Cache the JWT token to avoid fetching it on every request
  private cachedToken: string | null = null
  private tokenFetchPromise: Promise<string | null> | null = null
  private tokenFetchRetries = 0
  private maxRetries = 2

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Get JWT token from Better Auth, with caching to avoid redundant requests.
   * The token is fetched once and cached until it fails (401 response).
   * Includes retry logic for transient failures.
   */
  private async getToken(forceRefresh = false): Promise<string | null> {
    // Return cached token if available and not forcing refresh
    if (this.cachedToken && !forceRefresh) {
      log('Using cached JWT token')
      return this.cachedToken
    }

    // Avoid multiple simultaneous token fetch requests
    if (this.tokenFetchPromise) {
      log('Waiting for pending token fetch')
      return this.tokenFetchPromise
    }

    log('Fetching new JWT token from Better Auth')
    this.tokenFetchPromise = this.fetchTokenWithRetry()

    return this.tokenFetchPromise
  }

  /**
   * Fetch token with retry logic for transient failures.
   */
  private async fetchTokenWithRetry(): Promise<string | null> {
    try {
      const token = await getJwtToken()
      this.cachedToken = token
      this.tokenFetchPromise = null
      this.tokenFetchRetries = 0

      if (token) {
        log('JWT token obtained successfully')
        // Log first few characters for debugging (don't log full token)
        log('Token preview:', token.substring(0, 20) + '...')
      } else {
        warn('No JWT token available - user may not be authenticated')
      }
      return token
    } catch (err) {
      this.tokenFetchPromise = null

      // Retry on transient failures
      if (this.tokenFetchRetries < this.maxRetries) {
        this.tokenFetchRetries++
        warn(`Token fetch failed, retrying (${this.tokenFetchRetries}/${this.maxRetries})...`)
        await new Promise((resolve) => setTimeout(resolve, 500 * this.tokenFetchRetries))
        return this.fetchTokenWithRetry()
      }

      error('Failed to fetch JWT token after retries:', err)
      this.tokenFetchRetries = 0
      return null
    }
  }

  /**
   * Clear the cached token (called on 401 responses to force re-fetch).
   */
  clearCachedToken(): void {
    log('Clearing cached JWT token')
    this.cachedToken = null
    this.tokenFetchPromise = null
    this.tokenFetchRetries = 0
  }

  /**
   * Force refresh the token - useful after login/signup.
   */
  async refreshToken(): Promise<string | null> {
    log('Force refreshing JWT token')
    this.clearCachedToken()
    return this.getToken(true)
  }

  /**
   * Get headers including JWT token from Better Auth.
   * Attaches the token as a Bearer token in the Authorization header.
   */
  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Get JWT token and attach as Bearer token
    const token = await this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      log('Authorization header attached')
    } else {
      warn('No token available for Authorization header - API calls may fail with 401')
    }

    return headers
  }

  /**
   * Make an authenticated API request.
   * Handles 401 errors by clearing token cache, showing toast, and redirecting to login.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuthError = true
  ): Promise<T> {
    const headers = await this.getHeaders()

    try {
      log(`${options.method || 'GET'} ${endpoint}`)
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
        credentials: 'include', // Also send cookies for session validation
      })

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        error('401 Unauthorized - token expired or invalid')

        // Try to refresh token once
        if (retryOnAuthError) {
          log('Attempting token refresh and retry...')
          this.clearCachedToken()
          const newToken = await this.getToken(true)

          if (newToken) {
            log('Token refreshed, retrying request...')
            return this.request<T>(endpoint, options, false) // Don't retry again
          }
        }

        // Token refresh failed - redirect to login
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (currentPath !== '/login' && currentPath !== '/signup') {
            warn('Session expired, redirecting to login')
            // Use a small delay to allow any toast to show
            setTimeout(() => {
              window.location.href = '/login?session_expired=true'
            }, 100)
          }
        }
        throw new Error('Your session has expired. Please sign in again.')
      }

      // Handle other error responses
      if (!response.ok) {
        const errorBody: ApiError = await response.json().catch(() => ({
          detail: `Request failed with status ${response.status}`,
        }))

        error(`Request failed: ${endpoint}`, {
          status: response.status,
          error: errorBody.detail,
        })

        throw new Error(errorBody.detail)
      }

      // Handle 204 No Content
      if (response.status === 204) {
        log(`${endpoint} returned 204 No Content`)
        return undefined as T
      }

      const data = await response.json()
      log(`${endpoint} success`)
      return data
    } catch (err) {
      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        error('Network error:', err)
        throw new Error('Unable to connect to server. Please check your internet connection.')
      }

      // Re-throw other errors
      throw err
    }
  }

  // Task endpoints

  /**
   * List all tasks for the authenticated user.
   */
  async getTasks(
    userId: string,
    filters?: TaskFilters
  ): Promise<TaskListResponse> {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    if (filters?.sort) params.set('sort', filters.sort)
    if (filters?.order) params.set('order', filters.order)

    const queryString = params.toString()
    const endpoint = `/api/${userId}/tasks${queryString ? `?${queryString}` : ''}`

    return this.request<TaskListResponse>(endpoint)
  }

  /**
   * Get a single task by ID.
   */
  async getTask(userId: string, taskId: string): Promise<Task> {
    return this.request<Task>(`/api/${userId}/tasks/${taskId}`)
  }

  /**
   * Create a new task.
   */
  async createTask(userId: string, data: CreateTaskInput): Promise<Task> {
    return this.request<Task>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update a task (partial update).
   */
  async updateTask(
    userId: string,
    taskId: string,
    data: UpdateTaskInput
  ): Promise<Task> {
    return this.request<Task>(`/api/${userId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete a task.
   */
  async deleteTask(userId: string, taskId: string): Promise<void> {
    return this.request<void>(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Toggle task completion status.
   */
  async toggleTaskComplete(
    userId: string,
    taskId: string,
    currentStatus: boolean
  ): Promise<Task> {
    return this.updateTask(userId, taskId, { completed: !currentStatus })
  }
}

// Export singleton instance
export const api = new ApiClient()
