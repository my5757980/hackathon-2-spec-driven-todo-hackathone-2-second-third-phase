# Generated from @specs/api/mcp-tools.md
"""complete_task MCP tool implementation.

Marks a specific task as complete.
"""

from datetime import datetime
from typing import Optional, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from models.task import Task


async def complete_task(
    session: AsyncSession,
    user_id: str,
    task_id: Optional[str] = None,
    title_match: Optional[str] = None,
) -> dict[str, Any]:
    """Mark a task as complete.

    Args:
        session: Database session.
        user_id: The authenticated user's ID.
        task_id: The specific task ID (if known).
        title_match: Partial title to match (if task_id not provided).

    Returns:
        dict: Response with success status and task details or error.
    """
    # Validate parameters
    if not task_id and not title_match:
        return {
            "success": False,
            "error": "missing_parameter",
            "message": "Either task_id or title_match must be provided.",
        }

    # Find the task
    if task_id:
        # Direct lookup by ID
        try:
            task_id_int = int(task_id)
        except ValueError:
            return {
                "success": False,
                "error": "task_not_found",
                "message": f"I couldn't find a task with ID '{task_id}'.",
            }

        statement = select(Task).where(
            Task.id == task_id_int,
            Task.user_id == user_id,
        )
        result = await session.execute(statement)
        task = result.scalar_one_or_none()

        if not task:
            return {
                "success": False,
                "error": "task_not_found",
                "message": f"I couldn't find a task with ID '{task_id}'.",
            }

        tasks = [task]
    else:
        # Search by title match (case-insensitive, partial match)
        statement = select(Task).where(
            Task.user_id == user_id,
            Task.title.ilike(f"%{title_match}%"),
        )
        result = await session.execute(statement)
        tasks = list(result.scalars().all())

        if not tasks:
            return {
                "success": False,
                "error": "task_not_found",
                "message": f"I couldn't find a task matching '{title_match}'.",
            }

    # Handle multiple matches
    if len(tasks) > 1:
        return {
            "success": False,
            "error": "multiple_matches",
            "message": f"I found multiple tasks matching '{title_match}'. Which one did you mean?",
            "matches": [
                {"id": str(t.id), "title": t.title}
                for t in tasks
            ],
        }

    task = tasks[0]

    # Check if already complete
    if task.completed:
        return {
            "success": False,
            "error": "already_complete",
            "message": f"Task '{task.title}' is already marked as complete.",
        }

    # Mark as complete
    task.completed = True
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return {
        "success": True,
        "message": f"Task '{task.title}' has been marked as complete.",
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
