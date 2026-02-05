# Generated from @specs/api/mcp-tools.md
"""update_task MCP tool implementation.

Updates a task's title and/or description.
"""

from datetime import datetime
from typing import Optional, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from models.task import Task


async def update_task(
    session: AsyncSession,
    user_id: str,
    task_id: Optional[str] = None,
    title_match: Optional[str] = None,
    new_title: Optional[str] = None,
    new_description: Optional[str] = None,
) -> dict[str, Any]:
    """Update a task's title and/or description.

    Args:
        session: Database session.
        user_id: The authenticated user's ID.
        task_id: The specific task ID (if known).
        title_match: Partial title to match (if task_id not provided).
        new_title: The new title for the task.
        new_description: The new description for the task.

    Returns:
        dict: Response with success status, updated task, and changes tracking.
    """
    # Validate parameters
    if not task_id and not title_match:
        return {
            "success": False,
            "error": "missing_parameter",
            "message": "Either task_id or title_match must be provided.",
        }

    # Validate that at least one update field is provided
    if not new_title and new_description is None:
        return {
            "success": False,
            "error": "no_changes",
            "message": "At least one of new_title or new_description must be provided.",
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

    # Track changes
    changes: dict[str, dict[str, Any]] = {}
    old_title = task.title

    # Apply updates
    if new_title:
        new_title = new_title.strip()
        if new_title and new_title != task.title:
            changes["title"] = {
                "old": task.title,
                "new": new_title,
            }
            task.title = new_title

    if new_description is not None:
        new_desc = new_description.strip() if new_description else ""
        old_desc = task.description or ""
        if new_desc != old_desc:
            changes["description"] = {
                "old": old_desc,
                "new": new_desc,
            }
            task.description = new_desc if new_desc else None

    # Check if any changes were made
    if not changes:
        return {
            "success": False,
            "error": "no_changes",
            "message": "No changes were made - the values are the same.",
        }

    # Update timestamp and save
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return {
        "success": True,
        "message": f"Task '{old_title}' has been updated.",
        "task": {
            "id": str(task.id),
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description or "",
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat(),
        },
        "changes": changes,
    }
