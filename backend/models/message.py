# Generated from @specs/features/chatbot/data-model.md
"""Message model for the Todo AI Chatbot.

Defines the Message entity with role enum for chat history persistence.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Any, TYPE_CHECKING
from uuid import uuid4

from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy import JSON

if TYPE_CHECKING:
    from .conversation import Conversation


class MessageRole(str, Enum):
    """Message role enum for distinguishing sender."""

    user = "user"
    assistant = "assistant"


class MessageBase(SQLModel):
    """Base Message model with shared fields."""

    role: MessageRole
    content: str


class Message(MessageBase, table=True):
    """Message database model.

    Represents a single message in a conversation.

    Attributes:
        id: UUID primary key
        conversation_id: Foreign key to conversation
        role: Who sent the message (user or assistant)
        content: Message text content
        tool_calls: Optional JSON of tools called by assistant
        created_at: When message was sent
    """

    __tablename__ = "message"

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
    )
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    tool_calls: Optional[dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON, nullable=True),
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")


class MessageCreate(SQLModel):
    """Schema for creating a new message."""

    role: MessageRole
    content: str
    tool_calls: Optional[dict[str, Any]] = None


class MessageRead(MessageBase):
    """Schema for reading a message (API response)."""

    id: str
    conversation_id: str
    tool_calls: Optional[dict[str, Any]] = None
    created_at: datetime
