// Generated from @specs/ui/components.md
'use client'

import { Settings, BarChart3, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
}

interface UserMenuProps {
  user: User
  onSettings?: () => void
  onStats?: () => void
  onSignOut: () => void
  className?: string
}

function UserMenu({ user, onSettings, onStats, onSignOut, className }: UserMenuProps) {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email[0].toUpperCase()

  return (
    <DropdownMenu
      trigger={
        <Avatar
          src={user.image || undefined}
          alt={user.name || user.email}
          fallback={initials}
          size="sm"
          className="cursor-pointer hover:ring-2 hover:ring-[#3b82f6]/50 transition-all duration-150"
        />
      }
      align="right"
      className={className}
    >
      {/* User info header */}
      <div className="px-3 py-3 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <Avatar
            src={user.image || undefined}
            alt={user.name || user.email}
            fallback={initials}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#fafafa] truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-[#71717a] truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      {onSettings && (
        <DropdownMenuItem onClick={onSettings} icon={<Settings className="h-4 w-4" />}>
          Settings
        </DropdownMenuItem>
      )}

      {onStats && (
        <DropdownMenuItem onClick={onStats} icon={<BarChart3 className="h-4 w-4" />}>
          My Stats
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={onSignOut} icon={<LogOut className="h-4 w-4" />} danger>
        Sign Out
      </DropdownMenuItem>
    </DropdownMenu>
  )
}

export { UserMenu }
export type { User, UserMenuProps }
