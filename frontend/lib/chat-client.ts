// Generated from @specs/features/chatbot/spec.md
/**
 * Chat API client for Todo AI Chatbot.
 * Handles communication with the backend chat endpoint.
 */

import { getJwtToken } from './auth-client'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Debug flag
const DEBUG = process.env.NODE_ENV === 'development'

function log(...args: unknown[]) {
  if (DEBUG) {
    console.log('[Chat Client]', ...args)
  }
}

/**
 * Chat request interface
 */
export interface ChatRequest {
  message: string
  conversation_id?: string
}

/**
 * Tool call information
 */
export interface ToolCall {
  tool: string
  arguments: Record<string, unknown>
  result: Record<string, unknown>
}

/**
 * Chat response interface
 */
export interface ChatResponse {
  response: string
  conversation_id: string
  tool_calls?: ToolCall[]
}

/**
 * Chat error class
 */
export class ChatError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public detail?: string
  ) {
    super(message)
    this.name = 'ChatError'
  }
}

/**
 * Get headers for chat requests including JWT token
 */
async function getHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const token = await getJwtToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    log('JWT token attached to request')
  } else {
    log('No JWT token available')
  }

  return headers
}

/**
 * Send a chat message to the backend
 *
 * @param request - The chat request containing message and optional conversation_id
 * @param userId - The authenticated user's ID (passed from component with session)
 * @returns The chat response from the AI assistant
 * @throws ChatError if the request fails
 */
export async function sendChatMessage(request: ChatRequest, userId: string): Promise<ChatResponse> {
  if (!userId) {
    throw new ChatError('Not authenticated', 401, 'Please sign in to use the chat')
  }

  log('User ID:', userId)
  const endpoint = `${API_BASE_URL}/api/${userId}/chat`

  log('Sending chat message:', request.message.substring(0, 50) + '...')
  log('Endpoint:', endpoint)
  log('Conversation ID:', request.conversation_id)

  try {
    const headers = await getHeaders()
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: request.message,
        conversation_id: request.conversation_id,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const detail = errorData.detail || `Request failed with status ${response.status}`
      log('Chat request failed:', response.status, detail)
      throw new ChatError(detail, response.status, detail)
    }

    const data: ChatResponse = await response.json()
    log('Chat response received:', data.response.substring(0, 50) + '...')
    log('Tool calls:', data.tool_calls?.length || 0)

    return data
  } catch (error) {
    if (error instanceof ChatError) {
      throw error
    }
    log('Chat request error:', error)
    throw new ChatError(
      'Failed to send message. Please try again.',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

/**
 * Chat client class for managing conversations
 */
export class ChatClient {
  private conversationId: string | null = null
  private userId: string | null = null

  /**
   * Set the user ID for API calls
   */
  setUserId(id: string | null): void {
    this.userId = id
    log('User ID set:', id)
  }

  /**
   * Set the current conversation ID
   */
  setConversationId(id: string | null): void {
    this.conversationId = id
    log('Conversation ID set:', id)
  }

  /**
   * Get the current conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId
  }

  /**
   * Send a message in the current conversation
   */
  async sendMessage(message: string, userId?: string): Promise<ChatResponse> {
    const effectiveUserId = userId || this.userId
    if (!effectiveUserId) {
      throw new ChatError('Not authenticated', 401, 'Please sign in to use the chat')
    }

    const response = await sendChatMessage(
      {
        message,
        conversation_id: this.conversationId || undefined,
      },
      effectiveUserId
    )

    // Update conversation ID from response
    if (response.conversation_id) {
      this.conversationId = response.conversation_id
    }

    return response
  }

  /**
   * Start a new conversation
   */
  startNewConversation(): void {
    this.conversationId = null
    log('New conversation started')
  }
}

// Default client instance
export const chatClient = new ChatClient()
