# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""Reminder service for tracking upcoming reminders.

Handles calculation of reminder times and filtering tasks with upcoming reminders.
"""

from datetime import datetime, timedelta

from src.core.validators import reminder_offset_to_timedelta
from src.models.task import Task
from src.storage.task_store import TaskStore


class ReminderService:
    """Service for handling reminder operations.

    Tracks and calculates upcoming reminders for tasks.
    """

    def __init__(self, store: TaskStore) -> None:
        """Initialize the service with a task store.

        Args:
            store: TaskStore instance for persistence
        """
        self._store = store

    def get_upcoming_reminders(
        self, hours: int = 24
    ) -> list[tuple[Task, datetime]]:
        """Get tasks with reminders due within the specified hours.

        Args:
            hours: Number of hours to look ahead (default 24)

        Returns:
            List of (task, reminder_time) tuples, sorted by reminder time
        """
        now = datetime.now()
        cutoff = now + timedelta(hours=hours)
        results = []

        for task in self._store.get_all():
            # Skip completed tasks
            if task.completed:
                continue

            # Skip tasks without due date or reminder
            if task.due_date is None or task.reminder_offset is None:
                continue

            # Calculate reminder time
            offset = reminder_offset_to_timedelta(task.reminder_offset)
            reminder_time = task.due_date - offset

            # Check if reminder is within the window
            if now <= reminder_time <= cutoff:
                results.append((task, reminder_time))

        # Sort by reminder time (earliest first)
        results.sort(key=lambda x: x[1])

        return results

    def get_reminder_time(self, task: Task) -> datetime | None:
        """Get the reminder time for a task.

        Args:
            task: Task to calculate reminder for

        Returns:
            Datetime of reminder, or None if task has no reminder
        """
        if task.due_date is None or task.reminder_offset is None:
            return None

        offset = reminder_offset_to_timedelta(task.reminder_offset)
        return task.due_date - offset
