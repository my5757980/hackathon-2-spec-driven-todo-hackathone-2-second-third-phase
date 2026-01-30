// Generated from @specs/ui/components.md
'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-200"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={cn(
          'relative bg-[#232326] rounded-2xl shadow-lg',
          'w-full max-w-md mx-4 p-6',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-xl font-semibold text-[#fafafa]', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-[#a1a1aa] mt-1', className)}
      {...props}
    />
  )
}

function DialogContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('py-4', className)} {...props} />
  )
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex justify-end gap-3 pt-4 border-t border-[#27272a]', className)}
      {...props}
    />
  )
}

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClose: () => void
}

function DialogClose({ onClose, className, ...props }: DialogCloseProps) {
  return (
    <button
      onClick={onClose}
      className={cn(
        'absolute top-4 right-4 p-1 rounded-md',
        'text-[#71717a] hover:text-[#fafafa] hover:bg-[#1c1c1f]',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[#3b82f6]',
        className
      )}
      aria-label="Close dialog"
      {...props}
    >
      <X className="h-5 w-5" />
    </button>
  )
}

export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
}
