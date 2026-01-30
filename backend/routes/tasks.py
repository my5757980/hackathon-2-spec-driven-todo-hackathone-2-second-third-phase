# Generated from @specs/api/rest-endpoints.md
"""Task CRUD API endpoints.

RESTful endpoints for task management with user isolation.
All endpoints require JWT authentication and enforce user-scoped access.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from db import get_session
from dependencies.auth import get_current_user_id
from models.task import Task, TaskCreate, TaskUpdate, TaskRead, TaskListResponse

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])


def validate_user_access(path_user_id: str, auth_user_id: str) -> None:
    """Validate that path user_id matches authenticated user.

    Args:
        path_user_id: User ID from URL path
        auth_user_id: User ID from JWT token

    Raises:
        HTTPException: 401 if user IDs don't match
    """
    if path_user_id != auth_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    status: Optional[str] = Query(
        default="all",
        description="Filter by status: completed, pending, all",
    ),
    sort: Optional[str] = Query(
        default="created_at",
        description="Sort field: created_at, due_date, priority",
    ),
    order: Optional[str] = Query(
        default="desc",
        description="Sort order: asc, desc",
    ),
    session: AsyncSession = Depends(get_session),
    auth_user_id: str = Depends(get_current_user_id),
) -> TaskListResponse:
    """List all tasks for the authenticated user.

    Supports filtering by completion status and sorting.

    Args:
        user_id: User ID from URL path
        status: Filter by completed, pending, or all
        sort: Sort field (created_at, due_date, priority)
        order: Sort order (asc, desc)

    Returns:
        TaskListResponse with tasks list and count
    """
    print(f"[TASKS] GET /api/{user_id}/tasks - Listing tasks")
    print(f"[TASKS] Auth user_id from JWT: {auth_user_id}")
    print(f"[TASKS] Filters: status={status}, sort={sort}, order={order}")

    validate_user_access(user_id, auth_user_id)

    # Build query with user filter
    statement = select(Task).where(Task.user_id == auth_user_id)

    # Apply status filter
    if status == "completed":
        statement = statement.where(Task.completed == True)
    elif status == "pending":
        statement = statement.where(Task.completed == False)
    # "all" means no additional filter

    # Apply sorting
    sort_column = getattr(Task, sort, Task.created_at)
    if order == "asc":
        statement = statement.order_by(sort_column.asc())
    else:
        statement = statement.order_by(sort_column.desc())

    result = await session.execute(statement)
    tasks = result.scalars().all()

    print(f"[TASKS] Found {len(tasks)} tasks for user {auth_user_id}")

    return TaskListResponse(
        tasks=[TaskRead.model_validate(task) for task in tasks],
        count=len(tasks),
    )


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_session),
    auth_user_id: str = Depends(get_current_user_id),
) -> TaskRead:
    """Get a single task by ID.

    Args:
        user_id: User ID from URL path
        task_id: Task ID to retrieve

    Returns:
        TaskRead with task details

    Raises:
        HTTPException: 404 if task not found or belongs to another user
    """
    validate_user_access(user_id, auth_user_id)

    # Query with both task_id AND user_id for security
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == auth_user_id,
    )
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        # Return 404 (not 403) to prevent task enumeration
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskRead.model_validate(task)


@router.post("", response_model=TaskRead, status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_session),
    auth_user_id: str = Depends(get_current_user_id),
) -> TaskRead:
    """Create a new task.

    Args:
        user_id: User ID from URL path
        task_data: Task creation data

    Returns:
        TaskRead with created task details
    """
    print(f"[TASKS] POST /api/{user_id}/tasks - Creating task")
    print(f"[TASKS] Request body: {task_data.model_dump()}")
    print(f"[TASKS] Auth user_id from JWT: {auth_user_id}")
    print(f"[TASKS] Path user_id: {user_id}")

    validate_user_access(user_id, auth_user_id)

    # Validate title length
    if not task_data.title or len(task_data.title.strip()) == 0:
        print("[TASKS] Validation failed: Title is required")
        raise HTTPException(status_code=400, detail="Title is required")
    if len(task_data.title) > 200:
        print("[TASKS] Validation failed: Title too long")
        raise HTTPException(
            status_code=400,
            detail="Title must be 200 characters or less",
        )

    # Create task with user_id
    task = Task(
        **task_data.model_dump(),
        user_id=auth_user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    print(f"[TASKS] Inserting task into DB: {task}")

    try:
        session.add(task)
        await session.commit()
        await session.refresh(task)
        print(f"[TASKS] Task created successfully with ID: {task.id}")
    except Exception as e:
        print(f"[TASKS] Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create task")

    return TaskRead.model_validate(task)


@router.put("/{task_id}", response_model=TaskRead)
async def update_task_full(
    user_id: str,
    task_id: int,
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_session),
    auth_user_id: str = Depends(get_current_user_id),
) -> TaskRead:
    """Full update of a task (PUT - replace all fields).

    Args:
        user_id: User ID from URL path
        task_id: Task ID to update
        task_data: Complete task data

    Returns:
        TaskRead with updated task details

    Raises:
        HTTPException: 404 if task not found or belongs to another user
    """
    validate_user_access(user_id, auth_user_id)

    # Query with both task_id AND user_id for security
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == auth_user_id,
    )
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Validate title
    if not task_data.title or len(task_data.title.strip()) == 0:
        raise HTTPException(status_code=400, detail="Title is required")
    if len(task_data.title) > 200:
        raise HTTPException(
            status_code=400,
            detail="Title must be 200 characters or less",
        )

    # Update all fields
    for key, value in task_data.model_dump().items():
        setattr(task, key, value)
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskRead.model_validate(task)


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task_partial(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    session: AsyncSession = Depends(get_session),
    auth_user_id: str = Depends(get_current_user_id),
) -> TaskRead:
    """Partial update of a task (PATCH - update only provided fields).

    Args:
        user_id: User ID from URL path
        task_id: Task ID to update
        task_data: Partial task data

    Returns:
        TaskRead with updated task details

    Raises:
        HTTPException: 404 if task not found or belongs to another user
    """
    validate_user_access(user_id, auth_user_id)

    # Query with both task_id AND user_id for security
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == auth_user_id,
    )
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)

    # Validate title if provided
    if "title" in update_data:
        if not update_data["title"] or len(update_data["title"].strip()) == 0:
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        if len(update_data["title"]) > 200:
            raise HTTPException(
                status_code=400,
                detail="Title must be 200 characters or less",
            )

    for key, value in update_data.items():
        setattr(task, key, value)
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskRead.model_validate(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_session),
    auth_user_id: str = Depends(get_current_user_id),
) -> None:
    """Delete a task.

    Args:
        user_id: User ID from URL path
        task_id: Task ID to delete

    Raises:
        HTTPException: 404 if task not found or belongs to another user
    """
    validate_user_access(user_id, auth_user_id)

    # Query with both task_id AND user_id for security
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == auth_user_id,
    )
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()
