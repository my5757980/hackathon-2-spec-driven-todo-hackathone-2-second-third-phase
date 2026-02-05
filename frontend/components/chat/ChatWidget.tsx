// Generated from @specs/ui/chatkit.md
'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { ChatToggle } from './ChatToggle'
import { ChatPanel } from './ChatPanel'

/**
 * Main chat widget component.
 * Combines the toggle button and chat panel.
 * Only renders when user is authenticated.
 */
export function ChatWidget() {
  const { data: session, isPending } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // Don't render anything while checking auth
  if (isPending) {
    return null
  }

  // Only show chat for authenticated users
  if (!session?.user) {
    return null
  }

  return (
    <>
      {/* Toggle button - always visible when authenticated */}
      <ChatToggle isOpen={isOpen} onClick={handleToggle} />

      {/* Chat panel - slides in from right */}
      <ChatPanel isOpen={isOpen} onClose={handleClose} />
    </>
  )
}
