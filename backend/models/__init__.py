# Generated from @specs/database/schema.md
"""Backend models package.

Exports all database models and schemas.
"""

from models.task import (
    Task,
    TaskBase,
    TaskCreate,
    TaskUpdate,
    TaskRead,
    TaskListResponse,
)
from models.user import User
from models.conversation import (
    Conversation,
    ConversationBase,
    ConversationCreate,
    ConversationRead,
)
from models.message import (
    Message,
    MessageBase,
    MessageCreate,
    MessageRead,
    MessageRole,
)

__all__ = [
    # Task models
    "Task",
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskRead",
    "TaskListResponse",
    # User model
    "User",
    # Conversation models (Phase III)
    "Conversation",
    "ConversationBase",
    "ConversationCreate",
    "ConversationRead",
    # Message models (Phase III)
    "Message",
    "MessageBase",
    "MessageCreate",
    "MessageRead",
    "MessageRole",
]
