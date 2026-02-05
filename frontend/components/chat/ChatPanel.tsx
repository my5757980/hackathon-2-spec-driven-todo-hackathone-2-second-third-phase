// Generated from @specs/ui/chatkit.md
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { chatClient, ChatError } from '@/lib/chat-client'
import { dispatchTasksChanged } from '@/lib/task-events'
import { ChatHeader } from './ChatHeader'
import { ChatMessages, ChatMessage } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { QuickReplies, DEFAULT_QUICK_REPLIES } from './QuickReplies'

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Main chat panel with glassmorphism styling.
 * Slides in from the right side of the viewport.
 */
export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { data: session, isPending } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQuickReplies, setShowQuickReplies] = useState(true)

  // Add welcome message when panel opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && session?.user) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: session.user.name
          ? `Hi ${session.user.name}! 😊 How can I help you today? I can add, list, complete, update, or delete your tasks.`
          : "Hi there! 😊 How can I help you today? I can add, list, complete, update, or delete your tasks.",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      setShowQuickReplies(true)
    }
  }, [isOpen, session, messages.length])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!session?.user) {
      setError('Please sign in to use the chat')
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setShowQuickReplies(false)
    setIsTyping(true)
    setError(null)

    try {
      const response = await chatClient.sendMessage(content, session.user.id)

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Notify dashboard of task changes if any task-modifying tools were called
      if (response.tool_calls && response.tool_calls.length > 0) {
        const taskModifyingTools = ['add_task', 'complete_task', 'delete_task', 'update_task']
        const modifyingCall = response.tool_calls.find((tc) =>
          taskModifyingTools.includes(tc.tool)
        )
        if (modifyingCall) {
          // Map tool name to operation type
          const operationMap: Record<string, 'add' | 'complete' | 'delete' | 'update'> = {
            add_task: 'add',
            complete_task: 'complete',
            delete_task: 'delete',
            update_task: 'update',
          }
          dispatchTasksChanged(operationMap[modifyingCall.tool])
        }
      }

      // Show quick replies after list tasks
      if (
        response.tool_calls?.some((tc) => tc.tool === 'list_tasks') ||
        content.toLowerCase().includes('show') ||
        content.toLowerCase().includes('list')
      ) {
        setShowQuickReplies(true)
      }
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage =
        err instanceof ChatError
          ? err.detail || err.message
          : 'Something went wrong. Please try again.'
      setError(errorMessage)

      // Add error message from assistant
      const errorAssistant: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorAssistant])
    } finally {
      setIsTyping(false)
    }
  }, [session])

  const handleQuickReply = useCallback((reply: string) => {
    handleSendMessage(reply)
  }, [handleSendMessage])

  const handleNewConversation = useCallback(() => {
    chatClient.startNewConversation()
    setMessages([])
    setShowQuickReplies(true)
    setError(null)
  }, [])

  // Don't render if not authenticated
  if (isPending) {
    return null
  }

  if (!session?.user) {
    return null
  }

  return (
    <div
      className={`
        fixed top-0 right-0 h-screen w-[420px] z-40
        bg-[rgba(26,26,46,0.95)] backdrop-blur-[20px]
        border-l border-white/10
        shadow-[0_0_40px_rgba(0,0,0,0.5)]
        flex flex-col
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <ChatHeader onClose={onClose} />

      {/* Messages area */}
      <ChatMessages messages={messages} isTyping={isTyping} />

      {/* Quick replies */}
      {showQuickReplies && !isTyping && (
        <div className="px-4 pb-2">
          <QuickReplies
            replies={DEFAULT_QUICK_REPLIES}
            onSelect={handleQuickReply}
            disabled={isTyping}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 text-sm text-red-400 bg-red-500/10 border-t border-red-500/20">
          {error}
        </div>
      )}

      {/* Input area */}
      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  )
}
