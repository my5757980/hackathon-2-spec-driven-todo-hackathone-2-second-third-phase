// Generated from @specs/ui/chatkit.md
'use client'

import { MessageCircle } from 'lucide-react'

interface ChatToggleProps {
  isOpen: boolean
  onClick: () => void
}

/**
 * Floating chat toggle button with pulse animation.
 * Opens the chat panel. Hidden when panel is open (use header close button to close).
 */
export function ChatToggle({ isOpen, onClick }: ChatToggleProps) {
  // Hide the toggle button when panel is open - users close via header button
  if (isOpen) {
    return null
  }

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-gradient-to-br from-[#667eea] to-[#764ba2]
        flex items-center justify-center
        shadow-lg shadow-[#667eea]/40
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-xl hover:shadow-[#667eea]/50
        focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:ring-offset-2 focus:ring-offset-[#0a0a0b]
        animate-pulse-glow
      `}
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </button>
  )
}
