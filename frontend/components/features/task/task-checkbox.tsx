// Generated from @specs/ui/components.md
'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  taskTitle: string
  disabled?: boolean
  className?: string
}

function TaskCheckbox({ checked, onChange, taskTitle, disabled, className }: TaskCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Mark "${taskTitle}" as ${checked ? 'incomplete' : 'complete'}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex items-center justify-center',
        'h-5 w-5 rounded-full flex-shrink-0',
        'border-2 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0a0a0b]',
        checked
          ? 'bg-[#22c55e] border-[#22c55e]'
          : 'bg-transparent border-[#27272a] hover:border-[#3b82f6] hover:bg-[#3b82f6]/10',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {checked && (
        <Check
          className={cn(
            'h-3 w-3 text-white',
            'animate-in zoom-in-50 duration-150'
          )}
          strokeWidth={3}
        />
      )}
    </button>
  )
}

export { TaskCheckbox }
