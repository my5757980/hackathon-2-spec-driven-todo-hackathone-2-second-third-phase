# Generated from @specs/features/chatbot/data-model.md
"""Conversation model for the Todo AI Chatbot.

Defines the Conversation entity for chat session persistence.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import uuid4

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .message import Message


class ConversationBase(SQLModel):
    """Base Conversation model with shared fields."""

    title: Optional[str] = Field(default=None, max_length=255)


class Conversation(ConversationBase, table=True):
    """Conversation database model.

    Represents a chat session between a user and the AI assistant.

    Attributes:
        id: UUID primary key
        user_id: Foreign key to user (required for user isolation)
        title: Optional conversation title (auto-generated or user-set)
        created_at: When conversation started
        updated_at: Last activity timestamp
    """

    __tablename__ = "conversation"

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
    )
    user_id: str = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: list["Message"] = Relationship(back_populates="conversation")


class ConversationCreate(SQLModel):
    """Schema for creating a new conversation."""

    title: Optional[str] = Field(default=None, max_length=255)


class ConversationRead(ConversationBase):
    """Schema for reading a conversation (API response)."""

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
