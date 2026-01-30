// Generated from @specs/ui/components.md
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}

function DropdownMenu({ trigger, children, align = 'left', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[180px]',
            'bg-[#232326] border border-[#27272a] rounded-lg shadow-lg',
            'py-1 animate-in fade-in-0 zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean
  icon?: React.ReactNode
}

function DropdownMenuItem({ className, children, danger, icon, ...props }: DropdownMenuItemProps) {
  return (
    <button
      className={cn(
        'w-full px-3 py-2 text-left text-sm',
        'flex items-center gap-2',
        'transition-colors duration-150',
        'focus:outline-none focus:bg-[#1c1c1f]',
        danger
          ? 'text-[#ef4444] hover:bg-[#ef4444]/10'
          : 'text-[#fafafa] hover:bg-[#1c1c1f]',
        className
      )}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  )
}

function DropdownMenuSeparator() {
  return <div className="h-px bg-[#27272a] my-1" />
}

function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-3 py-2 text-xs font-medium text-[#71717a]', className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}
