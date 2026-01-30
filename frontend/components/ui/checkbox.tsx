// Generated from @specs/ui/components.md
'use client'

import { forwardRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 transition-all duration-150',
              'flex items-center justify-center',
              'peer-focus:ring-2 peer-focus:ring-[#3b82f6] peer-focus:ring-offset-2',
              'peer-focus:ring-offset-[#0a0a0b]',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              checked
                ? 'bg-[#22c55e] border-[#22c55e]'
                : 'bg-transparent border-[#27272a] hover:border-[#3b82f6] hover:bg-[#3b82f6]/10',
              className
            )}
          >
            {checked && (
              <Check className="w-3 h-3 text-white animate-in zoom-in-50 duration-150" />
            )}
          </div>
        </div>
        {label && (
          <span className={cn(
            'text-sm transition-all duration-150',
            checked ? 'text-[#71717a] line-through' : 'text-[#fafafa]'
          )}>
            {label}
          </span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
