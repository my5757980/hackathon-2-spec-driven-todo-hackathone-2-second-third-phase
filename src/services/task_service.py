# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""Task service layer with business logic and validation.

The TaskService wraps TaskStore to add validation before operations.
This layer is designed to be reusable in Phase 2 (FastAPI).
"""

from datetime import datetime

from src.errors import ERR_TASK_006, TaskNotFoundError, TaskValidationError
from src.models.recurring_interval import RecurringInterval
from src.models.task import Task, validate_description, validate_title
from src.storage.task_store import TaskStore


class TaskService:
    """Business logic layer for task operations.

    Handles validation and delegates to TaskStore for persistence.
    """

    def __init__(self, store: TaskStore | None = None) -> None:
        """Initialize the service with a task store.

        Args:
            store: Optional TaskStore instance. If not provided, creates a new one.
        """
        self._store = store if store is not None else TaskStore()

    def create_task(
        self,
        title: str,
        description: str | None = None,
        due_date: datetime | None = None,
        recurring_interval: RecurringInterval | None = None,
        reminder_offset: str | None = None,
        parent_task_id: int | None = None,
    ) -> Task:
        """Create a new task with validation.

        Args:
            title: Task title (1-200 characters)
            description: Optional description (max 1000 characters)
            due_date: Optional due date/time
            recurring_interval: Optional recurrence pattern
            reminder_offset: Optional reminder time before due date
            parent_task_id: Optional parent task ID for recurring instances

        Returns:
            The created Task with assigned ID

        Raises:
            TaskValidationError: If validation fails
        """
        validated_title = validate_title(title)
        validated_description = validate_description(description)

        return self._store.add(
            title=validated_title,
            description=validated_description,
            due_date=due_date,
            recurring_interval=recurring_interval,
            reminder_offset=reminder_offset,
            parent_task_id=parent_task_id,
        )

    def list_tasks(
        self,
        due_filter: str | None = None,
        sort_by: str | None = None,
    ) -> list[Task]:
        """Get all tasks with optional filtering and sorting.

        Args:
            due_filter: Filter by due date: "today", "week", "overdue"
            sort_by: Sort by: "due", "created"

        Returns:
            List of filtered/sorted tasks
        """
        from datetime import timedelta

        tasks = self._store.get_all()
        now = datetime.now()

        # Apply due date filter
        if due_filter:
            due_filter = due_filter.lower()

            if due_filter == "today":
                # Tasks due today (00:00 to 23:59)
                today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                today_end = today_start + timedelta(days=1)
                tasks = [
                    t
                    for t in tasks
                    if t.due_date and today_start <= t.due_date < today_end
                ]

            elif due_filter == "week":
                # Tasks due within next 7 days (including today)
                today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                week_end = today_start + timedelta(days=7)
                tasks = [
                    t
                    for t in tasks
                    if t.due_date and today_start <= t.due_date < week_end
                ]

            elif due_filter == "overdue":
                # Tasks overdue and not completed
                tasks = [
                    t
                    for t in tasks
                    if t.due_date and t.due_date < now and not t.completed
                ]

        # Apply sorting
        if sort_by:
            sort_by = sort_by.lower()

            if sort_by == "due":
                # Sort by due date, NULL due_dates at end
                tasks = sorted(
                    tasks,
                    key=lambda t: (
                        t.due_date is None,
                        t.due_date or datetime.max,
                    ),
                )

            elif sort_by == "created":
                tasks = sorted(tasks, key=lambda t: t.created_at)

        return tasks

    def get_task(self, task_id: int) -> Task:
        """Get a task by ID.

        Args:
            task_id: The task ID to retrieve

        Returns:
            The task

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        task = self._store.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def update_task(
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
    ) -> Task:
        """Update a task with validation.

        Args:
            task_id: The task ID to update
            title: New title (optional)
            description: New description (optional)
            due_date: New due date (optional)
            recurring_interval: New recurrence pattern (optional)
            reminder_offset: New reminder offset (optional)
            remove_due: Remove due date if True
            remove_recurring: Remove recurring interval if True
            remove_remind: Remove reminder if True

        Returns:
            The updated task

        Raises:
            TaskValidationError: If no updates provided or validation fails
            TaskNotFoundError: If task doesn't exist
        """
        # Check if any update is provided
        has_update = any(
            [
                title is not None,
                description is not None,
                due_date is not None,
                recurring_interval is not None,
                reminder_offset is not None,
                remove_due,
                remove_recurring,
                remove_remind,
            ]
        )

        if not has_update:
            raise TaskValidationError(
                "No updates provided. Use --title, --description, --due, --recurring, or --remind.",
                ERR_TASK_006,
            )

        # Validate inputs if provided
        validated_title = None
        validated_description = None

        if title is not None:
            validated_title = validate_title(title)

        if description is not None:
            validated_description = validate_description(description)

        task = self._store.update(
            task_id=task_id,
            title=validated_title,
            description=validated_description,
            due_date=due_date,
            recurring_interval=recurring_interval,
            reminder_offset=reminder_offset,
            remove_due=remove_due,
            remove_recurring=remove_recurring,
            remove_remind=remove_remind,
        )
        if task is None:
            raise TaskNotFoundError(task_id)

        return task

    def delete_task(self, task_id: int) -> None:
        """Delete a task by ID.

        Args:
            task_id: The task ID to delete

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        if not self._store.delete(task_id):
            raise TaskNotFoundError(task_id)

    def toggle_complete(self, task_id: int) -> Task:
        """Toggle task completion status (legacy method).

        Args:
            task_id: The task ID to toggle

        Returns:
            The task with updated status

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        task = self._store.toggle_complete(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def complete_task(self, task_id: int) -> tuple[Task, Task | None]:
        """Complete a task and create next occurrence if recurring.

        Args:
            task_id: The task ID to complete

        Returns:
            Tuple of (completed task, next occurrence or None)

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        from src.services.recurring_service import RecurringService

        task = self._store.toggle_complete(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        next_task = None
        if task.completed:
            # Check if this is a recurring task and create next occurrence
            recurring_service = RecurringService(self._store)
            if recurring_service.is_recurring_task(task):
                next_task = recurring_service.create_next_occurrence(task)

        return task, next_task

    def get_upcoming_reminders(self, hours: int = 24) -> list[Task]:
        """Get tasks with reminders due within the specified hours.

        Args:
            hours: Number of hours to look ahead (default 24)

        Returns:
            List of tasks with upcoming reminders, sorted by reminder time
        """
        from src.services.reminder_service import ReminderService

        reminder_service = ReminderService(self._store)
        results = reminder_service.get_upcoming_reminders(hours)

        # Return just the tasks (not the reminder times)
        return [task for task, _ in results]
