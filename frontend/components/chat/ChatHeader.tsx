// Generated from @specs/ui/chatkit.md
'use client'

import { X } from 'lucide-react'

interface ChatHeaderProps {
  onClose: () => void
}

/**
 * Chat panel header with avatar, status indicator, and close button.
 */
export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="h-[72px] px-4 flex items-center justify-between bg-gradient-to-b from-[rgba(102,126,234,0.1)] to-transparent border-b border-white/10">
      <div className="flex items-center gap-3">
        {/* Avatar with glow effect */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-xl animate-glow">
            🤖
          </div>
        </div>

        {/* Title and status */}
        <div>
          <h2 className="text-white font-semibold text-base">AI Assistant</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-blink" />
            <span className="text-white/60 text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-[#667eea]"
        aria-label="Close chat"
      >
        <X className="w-5 h-5" />
      </button>
    </header>
  )
}
