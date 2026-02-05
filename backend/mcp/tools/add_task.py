# Generated from @specs/api/mcp-tools.md
"""add_task MCP tool implementation.

Creates a new task for the authenticated user.
"""

from datetime import datetime
from typing import Optional, Any

from sqlalchemy.ext.asyncio import AsyncSession

from models.task import Task


async def add_task(
    session: AsyncSession,
    user_id: str,
    title: str,
    description: Optional[str] = None,
) -> dict[str, Any]:
    """Create a new task for the user.

    Args:
        session: Database session.
        user_id: The authenticated user's ID.
        title: The title/name of the task.
        description: Optional detailed description.

    Returns:
        dict: Response with success status, message, and task details.
    """
    # Validate title
    if not title or not title.strip():
        return {
            "success": False,
            "error": "validation_error",
            "message": "Title is required and cannot be empty.",
        }

    # Create the task
    task = Task(
        title=title.strip(),
        description=description.strip() if description else None,
        completed=False,
        user_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return {
        "success": True,
        "message": f"Task '{task.title}' has been added.",
        "task": {
            "id": str(task.id),
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description or "",
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat(),
        },
    }
