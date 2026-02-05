# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""Recurring task service for auto-rescheduling.

Handles creating the next occurrence of a recurring task when completed.
"""

from src.core.date_utils import add_interval
from src.models.recurring_interval import RecurringInterval
from src.models.task import Task
from src.storage.task_store import TaskStore


class RecurringService:
    """Service for handling recurring task operations.

    Creates next occurrences when recurring tasks are completed.
    """

    def __init__(self, store: TaskStore) -> None:
        """Initialize the service with a task store.

        Args:
            store: TaskStore instance for persistence
        """
        self._store = store

    def create_next_occurrence(self, task: Task) -> Task | None:
        """Create the next occurrence of a recurring task.

        Args:
            task: The completed recurring task

        Returns:
            The new task instance, or None if task is not recurring
        """
        if task.recurring_interval is None:
            return None

        if task.recurring_interval == RecurringInterval.NONE:
            return None

        # Calculate next due date
        next_due_date = None
        if task.due_date is not None:
            next_due_date = add_interval(task.due_date, task.recurring_interval)

        # Find the original task ID (parent or self)
        parent_id = task.parent_task_id if task.parent_task_id else task.id

        # Create next occurrence with same properties
        return self._store.add(
            title=task.title,
            description=task.description,
            due_date=next_due_date,
            recurring_interval=task.recurring_interval,
            reminder_offset=task.reminder_offset,
            parent_task_id=parent_id,
        )

    def is_recurring_task(self, task: Task) -> bool:
        """Check if a task is recurring.

        Args:
            task: Task to check

        Returns:
            True if task has recurring interval, False otherwise
        """
        if task.recurring_interval is None:
            return False
        return task.recurring_interval != RecurringInterval.NONE
