# Generated from @specs/database/schema.md
"""Task model for the Todo application.

Defines the Task entity with SQLModel for database persistence.
Follows the schema specification for Phase 2 multi-user support.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class TaskBase(SQLModel):
    """Base Task model with shared fields.

    Used for request/response schemas and inheritance.
    """

    title: str = Field(max_length=255, index=False)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False, index=True)
    priority: str = Field(default="P2")  # P1 (High), P2 (Medium), P3 (Low)
    due_date: Optional[str] = Field(default=None)  # YYYY-MM-DD format


class Task(TaskBase, table=True):
    """Task database model.

    Attributes:
        id: Auto-incrementing primary key
        title: Task name (max 255 characters, required)
        description: Optional task details
        completed: Completion status (default: False)
        priority: Priority level - P1, P2, P3 (default: P2)
        due_date: Optional due date in YYYY-MM-DD format
        created_at: Creation timestamp (auto-set)
        updated_at: Last update timestamp (auto-updated)
        user_id: Foreign key to user (required for user isolation)
    """

    __tablename__ = "task"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = Field(foreign_key="user.id", index=True)


class TaskCreate(TaskBase):
    """Schema for creating a new task.

    All fields from TaskBase except id and timestamps.
    """

    pass


class TaskUpdate(SQLModel):
    """Schema for updating a task.

    All fields are optional for partial updates (PATCH).
    """

    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None


class TaskRead(TaskBase):
    """Schema for reading a task (API response).

    Includes all task fields with id and timestamps.
    """

    id: int
    created_at: datetime
    updated_at: datetime


class TaskListResponse(SQLModel):
    """Response schema for listing tasks.

    Includes task list and count.
    """

    tasks: list[TaskRead]
    count: int
