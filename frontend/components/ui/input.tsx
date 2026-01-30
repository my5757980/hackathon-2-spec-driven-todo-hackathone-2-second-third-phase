// Generated from @specs/ui/components.md
'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, ...inputProps }, ref) => {
    // leftIcon is destructured separately to prevent it from being
    // spread onto the DOM input element (React warning: unrecognized prop)
    const hasIcon = Boolean(leftIcon)

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border bg-[#141416] px-3 py-2 text-sm',
            'text-[#fafafa] placeholder:text-[#71717a]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasIcon && 'pl-10',
            error
              ? 'border-[#ef4444] focus:ring-[#ef4444]'
              : 'border-[#27272a] focus:border-[#3b82f6]',
            className
          )}
          ref={ref}
          {...inputProps}
        />
        {error && (
          <p className="mt-1 text-xs text-[#ef4444]">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
