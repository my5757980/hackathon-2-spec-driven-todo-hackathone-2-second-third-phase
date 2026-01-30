// Generated from @specs/features/authentication/spec.md
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, clearJwtTokenCache } from '@/lib/auth-client'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignoutButtonProps {
  /** Show icon only on mobile */
  iconOnly?: boolean
  /** Additional CSS classes */
  className?: string
  /** Variant: primary shows colored button, ghost shows minimal styling */
  variant?: 'primary' | 'ghost'
}

export function SignoutButton({
  iconOnly = false,
  className,
  variant = 'ghost',
}: SignoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      // Clear JWT token cache first
      clearJwtTokenCache()
      await signOut()
      console.log('[SignoutButton] Sign out successful')
      // Force hard navigation to clear all client state
      window.location.href = '/login'
    } catch {
      // Even if signout fails, clear cache and redirect
      clearJwtTokenCache()
      window.location.href = '/login'
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 rounded-md transition-all',
        'focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0a0a0b]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'px-4 py-2 bg-[#ef4444] text-white hover:bg-[#dc2626]',
        variant === 'ghost' && 'px-4 py-2 bg-[#1c1c1f] text-[#a1a1aa] hover:bg-[#232326] hover:text-[#fafafa]',
        className
      )}
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" />
      {!iconOnly && (
        <span className={cn('text-sm', iconOnly && 'hidden md:inline')}>
          {loading ? 'Signing out...' : 'Sign Out'}
        </span>
      )}
    </button>
  )
}
