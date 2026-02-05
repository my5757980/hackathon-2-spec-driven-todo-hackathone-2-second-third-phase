# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""In-memory storage for tasks.

Uses a dict for O(1) lookups by ID. IDs are auto-incremented starting from 1.
This storage is transient - all data is lost when the application exits.
"""

from datetime import datetime

from src.models.recurring_interval import RecurringInterval
from src.models.task import Task


class TaskStore:
    """In-memory storage for tasks.

    Uses a dict for O(1) lookups by ID.
    IDs are auto-incremented starting from 1.
    """

    def __init__(self) -> None:
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add(
        self,
        title: str,
        description: str | None = None,
        due_date: datetime | None = None,
        recurring_interval: RecurringInterval | None = None,
        reminder_offset: str | None = None,
        parent_task_id: int | None = None,
    ) -> Task:
        """Create and store a new task.

        Args:
            title: Task title (already validated)
            description: Optional task description (already validated)
            due_date: Optional due date/time
            recurring_interval: Optional recurrence pattern
            reminder_offset: Optional reminder time before due date
            parent_task_id: Optional parent task ID for recurring instances

        Returns:
            The created task with ID assigned
        """
        task = Task(
            id=self._next_id,
            title=title,
            description=description,
            completed=False,
            created_at=datetime.now(),
            due_date=due_date,
            recurring_interval=recurring_interval,
            reminder_offset=reminder_offset,
            parent_task_id=parent_task_id,
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
        due_date: datetime | None = None,
        recurring_interval: RecurringInterval | None = None,
        reminder_offset: str | None = None,
        remove_due: bool = False,
        remove_recurring: bool = False,
        remove_remind: bool = False,
    ) -> Task | None:
        """Update task fields.

        Args:
            task_id: The task ID to update
            title: New title (if provided)
            description: New description (if provided)
            due_date: New due date (if provided)
            recurring_interval: New recurrence pattern (if provided)
            reminder_offset: New reminder offset (if provided)
            remove_due: Remove due date if True
            remove_recurring: Remove recurring interval if True
            remove_remind: Remove reminder if True

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

        # Handle due date
        if remove_due:
            task.due_date = None
            # Also remove reminder when due date is removed
            task.reminder_offset = None
        elif due_date is not None:
            task.due_date = due_date

        # Handle recurring interval
        if remove_recurring:
            task.recurring_interval = None
        elif recurring_interval is not None:
            if recurring_interval == RecurringInterval.NONE:
                task.recurring_interval = None
            else:
                task.recurring_interval = recurring_interval

        # Handle reminder
        if remove_remind:
            task.reminder_offset = None
        elif reminder_offset is not None:
            task.reminder_offset = reminder_offset

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
