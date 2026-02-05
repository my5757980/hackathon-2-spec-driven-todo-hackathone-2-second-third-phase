// Generated from @specs/ui/chatkit.md
'use client'

import { useEffect, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatMessagesProps {
  messages: ChatMessage[]
  isTyping?: boolean
}

/**
 * Scrollable messages area with auto-scroll.
 */
export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 animate-slide-up ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-[#f093fb] to-[#f5576c]'
                : 'bg-gradient-to-br from-[#667eea] to-[#764ba2]'
            }`}
          >
            {message.role === 'user' ? '👤' : '🤖'}
          </div>

          {/* Message bubble */}
          <div
            className={`max-w-[80%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-[#f093fb] to-[#f5576c] text-white rounded-tr-sm'
                  : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
              }`}
            >
              {message.content}
            </div>
            <span
              className={`text-[10px] text-white/40 mt-1 block ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-3 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex-shrink-0 flex items-center justify-center text-sm">
            🤖
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
