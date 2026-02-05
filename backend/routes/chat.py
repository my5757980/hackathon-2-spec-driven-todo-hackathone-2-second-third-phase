# Generated from @specs/features/chatbot/spec.md
"""Chat API endpoint.

Handles chat requests for the Todo AI Chatbot.
"""

import time
from typing import Optional
from collections import defaultdict
from threading import Lock

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from dependencies.auth import get_current_user_id
from services.chat_service import ChatService


router = APIRouter(prefix="/api/{user_id}/chat", tags=["chat"])


# Chat-specific rate limiter (60 requests per minute per user)
class ChatRateLimiter:
    """Simple rate limiter for chat endpoint - 60 req/min per user."""

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def check_rate_limit(self, user_id: str) -> None:
        """Check if user is rate limited."""
        current_time = time.time()

        with self._lock:
            # Clean old requests
            self._requests[user_id] = [
                t for t in self._requests[user_id]
                if current_time - t < self.window_seconds
            ]

            # Check limit
            if len(self._requests[user_id]) >= self.max_requests:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please wait before sending more messages."
                )

            # Record this request
            self._requests[user_id].append(current_time)


chat_rate_limiter = ChatRateLimiter()


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""

    message: str = Field(..., description="The user's message", min_length=1)
    conversation_id: Optional[str] = Field(
        default=None,
        description="Optional existing conversation ID for continuity",
    )


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""

    response: str = Field(..., description="The assistant's response")
    conversation_id: str = Field(..., description="The conversation ID")
    tool_calls: Optional[list[dict]] = Field(
        default=None,
        description="List of tools called during processing",
    )


def validate_user_access(path_user_id: str, auth_user_id: str) -> None:
    """Validate that path user_id matches authenticated user.

    Args:
        path_user_id: User ID from URL path.
        auth_user_id: User ID from JWT token.

    Raises:
        HTTPException: 401 if user IDs don't match.
    """
    if path_user_id != auth_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    session: AsyncSession = Depends(get_session),
    auth_user_id: str = Depends(get_current_user_id),
) -> ChatResponse:
    """Process a chat message and return the assistant's response.

    Handles the complete chat flow:
    1. Verifies JWT authentication
    2. Creates or continues a conversation
    3. Stores the user message
    4. Processes through AI agent with MCP tools
    5. Stores the assistant response
    6. Returns the response with conversation ID

    Args:
        user_id: User ID from URL path.
        request: Chat request containing message and optional conversation_id.
        session: Database session.
        auth_user_id: Authenticated user ID from JWT.

    Returns:
        ChatResponse with assistant message, conversation_id, and tool calls.

    Raises:
        HTTPException: 401 if unauthorized, 400 for validation errors.
    """
    print(f"[CHAT] POST /api/{user_id}/chat - Processing message")
    print(f"[CHAT] Message: {request.message[:50]}...")
    print(f"[CHAT] Conversation ID: {request.conversation_id}")
    print(f"[CHAT] Auth user_id from JWT: {auth_user_id}")

    # Validate user access
    validate_user_access(user_id, auth_user_id)

    # Check rate limit (60 requests per minute per user)
    chat_rate_limiter.check_rate_limit(auth_user_id)

    # Validate message
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    # Process through chat service
    chat_service = ChatService(session=session, user_id=auth_user_id)

    try:
        result = await chat_service.process_message(
            message=request.message.strip(),
            conversation_id=request.conversation_id,
        )

        print(f"[CHAT] Response generated successfully")
        print(f"[CHAT] Tool calls: {result.get('tool_calls')}")

        return ChatResponse(
            response=result["response"],
            conversation_id=result["conversation_id"],
            tool_calls=result.get("tool_calls"),
        )

    except Exception as e:
        print(f"[CHAT] Error processing message: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process message. Please try again.",
        )
