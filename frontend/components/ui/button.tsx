// Generated from @specs/ui/components.md
'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-medium rounded-md',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'focus:ring-[#3b82f6] focus:ring-offset-[#0a0a0b]',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variant styles
          variant === 'primary' && 'bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-[0.98]',
          variant === 'secondary' && 'bg-transparent border border-[#27272a] text-[#fafafa] hover:bg-[#1c1c1f]',
          variant === 'ghost' && 'bg-transparent text-[#a1a1aa] hover:bg-[#1c1c1f] hover:text-[#fafafa]',
          variant === 'destructive' && 'bg-[#ef4444] text-white hover:bg-red-600 active:scale-[0.98]',
          variant === 'link' && 'bg-transparent text-[#3b82f6] underline-offset-4 hover:underline',
          // Size styles
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-12 px-6 text-base',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
