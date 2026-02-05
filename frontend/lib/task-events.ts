/**
 * Task events utility for real-time sync between chatbot and dashboard.
 * Uses browser CustomEvent for cross-component communication.
 *
 * Created: 2026-02-05
 * Purpose: Allow ChatPanel to notify Dashboard when tasks are modified via chatbot
 */

// Event name constant
export const TASKS_CHANGED_EVENT = 'tasks-changed'

/**
 * Dispatch a tasks-changed event to notify listeners that tasks have been modified.
 * Call this after successful chat operations that modify tasks.
 *
 * @param operation - The type of operation that was performed (add, complete, delete, update)
 */
export function dispatchTasksChanged(operation?: 'add' | 'complete' | 'delete' | 'update' | 'list') {
  if (typeof window === 'undefined') return

  const event = new CustomEvent(TASKS_CHANGED_EVENT, {
    detail: { operation, timestamp: Date.now() },
  })
  window.dispatchEvent(event)

  if (process.env.NODE_ENV === 'development') {
    console.log('[TaskEvents] Dispatched tasks-changed event:', operation)
  }
}

/**
 * Add a listener for tasks-changed events.
 *
 * @param callback - Function to call when tasks change
 * @returns Cleanup function to remove the listener
 */
export function onTasksChanged(callback: (operation?: string) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ operation?: string; timestamp: number }>
    callback(customEvent.detail?.operation)
  }

  window.addEventListener(TASKS_CHANGED_EVENT, handler)

  return () => {
    window.removeEventListener(TASKS_CHANGED_EVENT, handler)
  }
}
