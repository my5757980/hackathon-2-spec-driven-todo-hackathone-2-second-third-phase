# Generated from @specs/api/mcp-tools.md
"""list_tasks MCP tool implementation.

Retrieves all tasks belonging to the authenticated user with optional status filtering.
"""

from typing import Optional, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from models.task import Task


async def list_tasks(
    session: AsyncSession,
    user_id: str,
    status: Optional[str] = "all",
) -> dict[str, Any]:
    """Retrieve all tasks for the user.

    Args:
        session: Database session.
        user_id: The authenticated user's ID.
        status: Filter by status: "all", "pending", or "completed".

    Returns:
        dict: Response with success status, tasks list, count, and filter.
    """
    # Validate status filter
    valid_statuses = ["all", "pending", "completed"]
    if status and status not in valid_statuses:
        return {
            "success": False,
            "error": "invalid_filter",
            "message": "Invalid status filter. Use 'all', 'pending', or 'completed'.",
        }

    # Build query with user filter
    statement = select(Task).where(Task.user_id == user_id)

    # Apply status filter
    if status == "completed":
        statement = statement.where(Task.completed == True)
    elif status == "pending":
        statement = statement.where(Task.completed == False)
    # "all" means no additional filter

    # Order by creation date (oldest first)
    statement = statement.order_by(Task.created_at.asc())

    result = await session.execute(statement)
    tasks = result.scalars().all()

    # Format response
    task_list = [
        {
            "id": str(task.id),
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description or "",
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat(),
        }
        for task in tasks
    ]

    count = len(task_list)

    # Generate appropriate message
    if count == 0:
        if status == "pending":
            message = "You don't have any pending tasks."
        elif status == "completed":
            message = "You don't have any completed tasks."
        else:
            message = "You don't have any tasks yet."
    else:
        if status == "pending":
            message = f"You have {count} pending task(s)."
        elif status == "completed":
            message = f"You have {count} completed task(s)."
        else:
            message = f"You have {count} task(s)."

    return {
        "success": True,
        "message": message,
        "tasks": task_list,
        "count": count,
        "filter": status or "all",
    }
