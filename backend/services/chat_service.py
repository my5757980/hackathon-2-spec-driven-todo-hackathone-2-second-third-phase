# Generated from @specs/features/chatbot/spec.md
"""Chat service for conversation management.

Orchestrates the chat flow including conversation persistence,
message storage, and agent invocation.
"""

from datetime import datetime
from typing import Optional, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from models.conversation import Conversation
from models.message import Message, MessageRole
from agent.todo_agent import TodoAgent


class ChatService:
    """Service for managing chat conversations and messages."""

    def __init__(self, session: AsyncSession, user_id: str):
        """Initialize the chat service.

        Args:
            session: Database session.
            user_id: The authenticated user's ID.
        """
        self.session = session
        self.user_id = user_id

    async def get_or_create_conversation(
        self,
        conversation_id: Optional[str] = None,
    ) -> Conversation:
        """Get an existing conversation or create a new one.

        Args:
            conversation_id: Optional ID of existing conversation.

        Returns:
            Conversation: The conversation instance.
        """
        if conversation_id:
            # Load existing conversation
            statement = select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == self.user_id,
            )
            result = await self.session.execute(statement)
            conversation = result.scalar_one_or_none()

            if conversation:
                return conversation

        # Create new conversation
        conversation = Conversation(
            user_id=self.user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)

        return conversation

    async def store_message(
        self,
        conversation_id: str,
        role: MessageRole,
        content: str,
        tool_calls: Optional[dict[str, Any]] = None,
    ) -> Message:
        """Store a message in the conversation.

        Args:
            conversation_id: The conversation ID.
            role: Message role (user or assistant).
            content: Message content.
            tool_calls: Optional tool calls made by assistant.

        Returns:
            Message: The stored message.
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            created_at=datetime.utcnow(),
        )
        self.session.add(message)

        # Update conversation's updated_at timestamp
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
        )
        result = await self.session.execute(statement)
        conversation = result.scalar_one_or_none()
        if conversation:
            conversation.updated_at = datetime.utcnow()
            self.session.add(conversation)

        await self.session.commit()
        await self.session.refresh(message)

        return message

    async def load_recent_messages(
        self,
        conversation_id: str,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """Load recent messages from a conversation.

        Args:
            conversation_id: The conversation ID.
            limit: Maximum number of messages to load.

        Returns:
            list: List of message dictionaries formatted for agent context.
        """
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(statement)
        messages = list(result.scalars().all())

        # Reverse to get chronological order
        messages.reverse()

        # Format for agent context
        return [
            {
                "role": msg.role.value,
                "content": msg.content,
            }
            for msg in messages
        ]

    async def process_message(
        self,
        message: str,
        conversation_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """Process a user message through the chat flow.

        1. Get or create conversation
        2. Store user message
        3. Load conversation history
        4. Invoke agent
        5. Store assistant response
        6. Return response

        Args:
            message: The user's message.
            conversation_id: Optional existing conversation ID.

        Returns:
            dict: Response containing assistant message, conversation_id, and tool calls.
        """
        # Step 1: Get or create conversation
        conversation = await self.get_or_create_conversation(conversation_id)

        # Step 2: Store user message
        await self.store_message(
            conversation_id=conversation.id,
            role=MessageRole.user,
            content=message,
        )

        # Step 3: Load conversation history for context
        history = await self.load_recent_messages(conversation.id)

        # Step 4: Invoke agent
        agent = TodoAgent(user_id=self.user_id)
        agent_response = await agent.process_message(
            message=message,
            session=self.session,
            conversation_history=history[:-1],  # Exclude current message (already in prompt)
        )

        # Step 5: Store assistant response
        await self.store_message(
            conversation_id=conversation.id,
            role=MessageRole.assistant,
            content=agent_response.get("response", ""),
            tool_calls=agent_response.get("tool_calls"),
        )

        # Step 6: Return response
        return {
            "response": agent_response.get("response", ""),
            "conversation_id": conversation.id,
            "tool_calls": agent_response.get("tool_calls"),
        }
