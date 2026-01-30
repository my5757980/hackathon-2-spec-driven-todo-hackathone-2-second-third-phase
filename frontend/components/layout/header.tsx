// Generated from @specs/ui/components.md
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Bell, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserMenu, type User } from '@/components/features/auth/user-menu'
import { signOut, clearJwtTokenCache } from '@/lib/auth-client'

interface HeaderProps {
  user?: User | null
  notificationCount?: number
  onSearch?: (query: string) => void
  className?: string
}

function Header({ user, notificationCount = 0, onSearch, className }: HeaderProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)

  // Handle sign out using Better Auth
  const handleSignOut = async () => {
    console.log('[Header] Sign out initiated')
    try {
      // Clear JWT token cache first
      clearJwtTokenCache()
      await signOut()
      console.log('[Header] Sign out successful, redirecting to /login')
      // Force a hard navigation to clear all client state
      window.location.href = '/login'
    } catch (error) {
      console.error('[Header] Sign out error:', error)
      // Even if signout fails, clear token cache and redirect
      clearJwtTokenCache()
      window.location.href = '/login'
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'bg-[#0a0a0b]/95 backdrop-blur-sm',
        'border-b border-[#27272a]',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo (always visible) and mobile menu button */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#71717a] hover:text-[#fafafa] transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-[#fafafa]">TODO</span>
            </Link>
          </div>

          {/* Center: Search (desktop) */}
          {user && onSearch && (
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch}>
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  aria-label="Search tasks"
                />
              </form>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Mobile search toggle */}
                {onSearch && (
                  <button
                    onClick={() => setSearchExpanded(!searchExpanded)}
                    className="lg:hidden p-2 text-[#71717a] hover:text-[#fafafa] transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}

                {/* Notifications */}
                <button
                  className="relative p-2 text-[#71717a] hover:text-[#fafafa] transition-colors"
                  aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#ef4444] text-[10px] text-white flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* User menu */}
                <UserMenu
                  user={user}
                  onSettings={() => router.push('/settings')}
                  onSignOut={handleSignOut}
                />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile search (expanded) */}
        {searchExpanded && user && onSearch && (
          <div className="lg:hidden py-3 border-t border-[#27272a]">
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </header>
  )
}

// Minimal header for public pages (landing, auth)
interface PublicHeaderProps {
  className?: string
}

function PublicHeader({ className }: PublicHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'bg-[#0a0a0b]/95 backdrop-blur-sm',
        'border-b border-[#27272a]',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-[#fafafa]">TODO</span>
          </Link>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export { Header, PublicHeader }
export type { HeaderProps }
