# Generated from @specs/features/task-crud/spec.md
"""In-memory storage for tasks.

Uses a dict for O(1) lookups by ID. IDs are auto-incremented starting from 1.
This storage is transient - all data is lost when the application exits.
"""

from datetime import datetime

from src.models.task import Task


class TaskStore:
    """In-memory storage for tasks.

    Uses a dict for O(1) lookups by ID.
    IDs are auto-incremented starting from 1.
    """

    def __init__(self) -> None:
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add(self, title: str, description: str | None = None) -> Task:
        """Create and store a new task.

        Args:
            title: Task title (already validated)
            description: Optional task description (already validated)

        Returns:
            The created task with ID assigned
        """
        task = Task(
            id=self._next_id,
            title=title,
            description=description,
            completed=False,
            created_at=datetime.now(),
        )
        self._tasks[self._next_id] = task
        self._next_id += 1
        return task

    def get_all(self) -> list[Task]:
        """Return all tasks sorted by ID (creation order).

        Returns:
            List of all tasks sorted by ID
        """
        return sorted(self._tasks.values(), key=lambda t: t.id)

    def get_by_id(self, task_id: int) -> Task | None:
        """Return task by ID or None if not found.

        Args:
            task_id: The task ID to look up

        Returns:
            The task if found, None otherwise
        """
        return self._tasks.get(task_id)

    def update(
        self,
        task_id: int,
        title: str | None = None,
        description: str | None = None,
    ) -> Task | None:
        """Update task fields.

        Args:
            task_id: The task ID to update
            title: New title (if provided)
            description: New description (if provided)

        Returns:
            Updated task or None if not found
        """
        task = self._tasks.get(task_id)
        if task is None:
            return None

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description

        return task

    def delete(self, task_id: int) -> bool:
        """Delete task.

        Args:
            task_id: The task ID to delete

        Returns:
            True if deleted, False if not found
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def toggle_complete(self, task_id: int) -> Task | None:
        """Toggle task completion status.

        Args:
            task_id: The task ID to toggle

        Returns:
            Task with updated status or None if not found
        """
        task = self._tasks.get(task_id)
        if task is None:
            return None

        task.completed = not task.completed
        return task
