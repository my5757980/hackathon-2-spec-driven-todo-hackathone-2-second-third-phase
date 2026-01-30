# Generated from @specs/features/task-crud/spec.md
"""Task service layer with business logic and validation.

The TaskService wraps TaskStore to add validation before operations.
This layer is designed to be reusable in Phase 2 (FastAPI).
"""

from src.errors import ERR_TASK_006, TaskNotFoundError, TaskValidationError
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

    def create_task(self, title: str, description: str | None = None) -> Task:
        """Create a new task with validation.

        Args:
            title: Task title (1-200 characters)
            description: Optional description (max 1000 characters)

        Returns:
            The created Task with assigned ID

        Raises:
            TaskValidationError: If validation fails
        """
        validated_title = validate_title(title)
        validated_description = validate_description(description)

        return self._store.add(validated_title, validated_description)

    def list_tasks(self) -> list[Task]:
        """Get all tasks sorted by ID.

        Returns:
            List of all tasks in creation order
        """
        return self._store.get_all()

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
    ) -> Task:
        """Update a task with validation.

        Args:
            task_id: The task ID to update
            title: New title (optional)
            description: New description (optional)

        Returns:
            The updated task

        Raises:
            TaskValidationError: If no updates provided or validation fails
            TaskNotFoundError: If task doesn't exist
        """
        if title is None and description is None:
            raise TaskValidationError(
                "No updates provided. Use --title or --description.",
                ERR_TASK_006,
            )

        # Validate inputs if provided
        validated_title = None
        validated_description = None

        if title is not None:
            validated_title = validate_title(title)

        if description is not None:
            validated_description = validate_description(description)

        task = self._store.update(task_id, validated_title, validated_description)
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
        """Toggle task completion status.

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
