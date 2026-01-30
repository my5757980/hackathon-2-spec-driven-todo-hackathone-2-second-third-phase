// Generated from @specs/ui/components.md
'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 5000) => {
    const id = Math.random().toString(36).slice(2, 9)
    const toast: Toast = { id, message, variant, duration }

    setToasts((prev) => [...prev, toast])

    // Auto-dismiss for success and info
    if (variant === 'success' || variant === 'info') {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle; borderColor: string; iconColor: string }> = {
  success: {
    icon: CheckCircle,
    borderColor: 'border-l-[#22c55e]',
    iconColor: 'text-[#22c55e]',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-l-[#ef4444]',
    iconColor: 'text-[#ef4444]',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-[#f59e0b]',
    iconColor: 'text-[#f59e0b]',
  },
  info: {
    icon: Info,
    borderColor: 'border-l-[#06b6d4]',
    iconColor: 'text-[#06b6d4]',
  },
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = variantConfig[toast.variant]
  const Icon = config.icon

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'min-w-[300px] max-w-[400px]',
        'bg-[#232326] border border-[#27272a] rounded-lg shadow-lg',
        'border-l-4',
        config.borderColor,
        'animate-in slide-in-from-right-5 fade-in-0 duration-200'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', config.iconColor)} />
      <span className="flex-1 text-sm text-[#fafafa]">{toast.message}</span>
      <button
        onClick={onClose}
        className={cn(
          'p-1 rounded-md flex-shrink-0',
          'text-[#71717a] hover:text-[#fafafa] hover:bg-[#1c1c1f]',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#3b82f6]'
        )}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Convenience functions for direct usage
export function toast(message: string, variant: ToastVariant = 'info') {
  // This is a placeholder - in real usage, the ToastProvider handles this
  console.warn('toast() called outside of ToastProvider context')
}

export { type ToastVariant, type Toast }
