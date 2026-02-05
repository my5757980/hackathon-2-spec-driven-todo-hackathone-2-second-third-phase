// Generated from @specs/ui/chatkit.md
'use client'

/**
 * Typing indicator with bouncing dots animation.
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-slide-up">
      {/* Bot avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex-shrink-0 flex items-center justify-center text-sm">
        🤖
      </div>

      {/* Dots container */}
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5">
          <span
            className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
            style={{ animationDelay: '0s', animationDuration: '1.4s' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
            style={{ animationDelay: '0.15s', animationDuration: '1.4s' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
            style={{ animationDelay: '0.3s', animationDuration: '1.4s' }}
          />
        </div>
      </div>
    </div>
  )
}
