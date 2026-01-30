// Generated from @specs/ui/components.md
'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder = 'Select...', className, disabled }, ref) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md',
            'border border-[#27272a] bg-[#141416] px-3 py-2 text-sm',
            'text-[#fafafa] transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            open && 'ring-2 ring-[#3b82f6] border-transparent'
          )}
        >
          <span className={selectedOption ? 'text-[#fafafa]' : 'text-[#71717a]'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-[#71717a] transition-transform duration-150',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div
            className={cn(
              'absolute z-50 mt-1 w-full',
              'bg-[#232326] border border-[#27272a] rounded-md shadow-lg',
              'py-1 max-h-60 overflow-auto',
              'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value)
                  setOpen(false)
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm',
                  'flex items-center justify-between',
                  'transition-colors duration-150',
                  'hover:bg-[#1c1c1f]',
                  option.value === value && 'bg-[#3b82f6]/10 text-[#3b82f6]'
                )}
              >
                {option.label}
                {option.value === value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
export type { SelectOption }
