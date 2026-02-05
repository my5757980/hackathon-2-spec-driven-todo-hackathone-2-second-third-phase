// Generated from @specs/ui/chatkit.md
'use client'

interface QuickRepliesProps {
  replies: string[]
  onSelect: (reply: string) => void
  disabled?: boolean
}

/**
 * Quick reply pill buttons below bot messages.
 */
export function QuickReplies({ replies, onSelect, disabled }: QuickRepliesProps) {
  if (replies.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2 ml-11">
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          disabled={disabled}
          className="px-4 py-2 rounded-full bg-[#667eea]/20 border border-[#667eea]/40 text-white/90 text-[13px] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#667eea]/30 hover:border-[#667eea]/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#667eea]"
        >
          {reply}
        </button>
      ))}
    </div>
  )
}

/**
 * Default quick reply options
 */
export const DEFAULT_QUICK_REPLIES = [
  'Show my tasks',
  'Add new task',
  "What's pending?",
]
