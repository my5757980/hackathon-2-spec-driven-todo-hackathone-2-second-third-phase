// Generated from @specs/ui/chatkit.md
'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

/**
 * Chat input area with rounded input and gradient send button.
 */
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-[72px] px-4 py-3 bg-[rgba(26,26,46,0.8)] border-t border-white/10 flex items-center gap-3">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 h-11 px-4 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#667eea]/50 focus:bg-white/8 transition-all duration-200 disabled:opacity-50"
        aria-label="Chat message input"
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="w-11 h-11 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white shadow-md shadow-[#667eea]/30 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#667eea]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:ring-offset-2 focus:ring-offset-[#1a1a2e]"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  )
}
